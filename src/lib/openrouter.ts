import {
  awards,
  bio,
  conditionsTreated,
  contact,
  doctor,
  memberships,
  procedures,
  publications,
  speakingEngagements,
  specialInterest,
} from "@/content/doctor";

import { SITE_NAME, SITE_URL } from "@/lib/constants";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
/**
 * Ordered fallback chain of free models. OpenRouter tries these in order and
 * serves the first that responds.
 *
 * The ordering rule that matters: every ":free" model on OpenRouter is served
 * by exactly ONE provider pool, and those shared pools return 429 whenever
 * they are saturated. A chain is therefore only useful if consecutive entries
 * sit on DIFFERENT pools — listing two Google models back to back buys
 * nothing, because they fail together. Each entry below is on its own pool.
 *
 * Deliberately excluded: the `nvidia/nemotron-*:free` models (return empty
 * whitespace bodies rather than JSON), `poolside/*` and `cohere/north-mini-code`
 * (code-specialised), `google/lyria-*` (audio), `liquid/lfm-2.5-2.6b` (2.6B —
 * too small to be trusted with the medical-advice refusal), and
 * `openrouter/free` (picks a random model per request, so refusal behaviour
 * would vary call to call).
 */
const DEFAULT_MODEL_CHAIN = [
  "minimax/minimax-m3:free", //            GMICloud        — 45.4, no reasoning overhead
  "google/gemma-4-31b-it:free", //         Google AI Studio — instruction-tuned, best multilingual
  "z-ai/glm-5.2:free", //                  Decart          — 52.6, highest capability
  "thinkingmachines/inkling-small:free", //ThinkingMachines — 41.2
  "dots-studio/dots-3-note-preview:free", //AtlasCloud     — fast, verified
];

// Comma-separated override, e.g. OPENROUTER_MODELS="a:free,b:free".
// OPENROUTER_MODEL (singular) still works and sets the primary only.
function resolveModelChain(): string[] {
  const multi = (process.env.OPENROUTER_MODELS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (multi.length) return multi;

  const single = process.env.OPENROUTER_MODEL?.trim();
  if (single) return [single, ...DEFAULT_MODEL_CHAIN.filter((m) => m !== single)];

  return DEFAULT_MODEL_CHAIN;
}

// Models with mandatory or default-on reasoning honour this; models without a
// reasoning mode ignore it. "low" keeps latency down for short FAQ answers.
const REASONING_EFFORT = "low";

// Reasoning tokens are billed and counted as output, so they share this
// budget with the visible reply. At 400 (the old cap for a non-reasoning
// model) reasoning could consume the whole allowance and return an empty
// answer, so there is deliberate headroom here.
const MAX_TOKENS = 2000;

/** OpenRouter rejects a `models` array longer than this with a 400. */
const MAX_MODELS_PER_REQUEST = 3;

/** Ceiling for any single round trip. */
const REQUEST_TIMEOUT_MS = 25_000;

/**
 * Ceiling for the whole chain, across every batch. Saturated pools reject in
 * well under a second, so the common case stays fast; this only bites when a
 * pool is live but slow.
 */
const TOTAL_BUDGET_MS = 40_000;

// HTTP header values must be ByteString-safe; SITE_NAME contains an em-dash,
// which throws when passed to fetch(). Strip anything outside printable ASCII.
const ASCII_SITE_NAME = SITE_NAME.replace(/[^\x20-\x7E]/g, "-");

export type ChatRole = "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

/**
 * Raised when every model in the chain is rate-limited upstream. Free
 * OpenRouter pools are shared and return 429 when saturated, which is an
 * expected, transient condition rather than a fault — the UI should invite a
 * retry instead of reporting a breakage.
 */
export class OpenRouterBusyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterBusyError";
  }
}

function buildSiteContext(): string {
  const publicationLines = publications
    .map((p) => {
      const meta = [p.journal, p.volume && `Vol. ${p.volume}`, p.issue && `Issue ${p.issue}`, p.pages, p.year]
        .filter(Boolean)
        .join(", ");
      return `- ${p.title}${p.authors ? ` (${p.authors})` : ""}${meta ? ` — ${meta}` : ""}`;
    })
    .join("\n");

  return `
Doctor: ${doctor.name}, ${doctor.credentials}
Specialty: ${doctor.specialty}
Affiliation: ${doctor.hospital}
Experience: ${doctor.experienceYears}+ years
Languages spoken: ${doctor.languages.join(", ")}

Bio:
${bio.join("\n\n")}

Conditions treated: ${conditionsTreated.join(", ")}
Procedures performed: ${procedures.join(", ")}
Special interest: ${specialInterest.title} — ${specialInterest.description}

Publications:
${publicationLines}

Awards & memberships: ${[...awards, ...memberships].join("; ")}
Speaking engagements: ${speakingEngagements.join("; ")}

Clinic / contact:
- Clinic: ${contact.clinicName}, ${contact.fullAddress}
- Office hours: ${contact.officeHours}
- Email: ${contact.email}
- WhatsApp: ${contact.whatsappDisplay}
- Booking: patients can request an appointment via the Contact section on this website, by emailing, or by messaging on WhatsApp.
`.trim();
}

function buildSystemPrompt(): string {
  return `You are the practice FAQ assistant for ${doctor.name}'s website. You ONLY answer questions using the information below about Dr. Gupta's background, qualifications, conditions treated, procedures offered, languages spoken, clinic location, and how to book an appointment.

Strict rules:
- You are NOT a medical professional and must NEVER diagnose, interpret symptoms, or give treatment/medical advice of any kind, even in general terms.
- If asked anything resembling a medical question (symptoms, "should I be worried about X", medication questions, interpreting test results, etc.), politely decline and redirect: tell them to please request an appointment with Dr. Gupta or message the clinic on WhatsApp so he can advise them properly.
- Do not speculate or make up information that is not in the context below. If you don't know, say so and suggest contacting the clinic directly.
- Keep answers concise and friendly.

Practice information you may use to answer questions:
${buildSiteContext()}`;
}

/**
 * True when an OpenRouter error body names the upstream provider that failed,
 * which marks the failure as the pool's rather than ours.
 */
function isProviderSideError(errorText: string): boolean {
  try {
    const parsed = JSON.parse(errorText);
    return Boolean(parsed?.error?.metadata?.provider_name);
  } catch {
    return false;
  }
}

/** One request against up to MAX_MODELS_PER_REQUEST models. */
async function attemptBatch(
  apiKey: string,
  batch: string[],
  messages: ChatMessage[],
  timeoutMs: number
): Promise<string> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // Attribution for the OpenRouter dashboard.
      ...(SITE_URL ? { "HTTP-Referer": SITE_URL } : {}),
      "X-Title": ASCII_SITE_NAME,
    },
    body: JSON.stringify({
      model: batch[0],
      // OpenRouter walks this list in order, serving the first that responds.
      models: batch,
      messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
      temperature: 0.3,
      max_tokens: MAX_TOKENS,
      // Models that cannot disable reasoning honour `effort`; models with no
      // reasoning mode ignore this object entirely.
      reasoning: { effort: REASONING_EFFORT },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    if (response.status === 429 || response.status >= 500) {
      throw new OpenRouterBusyError(`Upstream unavailable (${response.status}): ${errorText}`);
    }
    // OpenRouter reports a failure inside the provider itself as a 4xx whose
    // body carries `metadata.provider_name` — observed in the wild as
    // AtlasCloud returning a bare 400 "bad request". That is the provider
    // being unhealthy, not a fault in our request, so the next batch (on a
    // different pool) is worth trying. A 400 without provider metadata, or a
    // 401/403, really is ours and aborts the chain immediately.
    if (isProviderSideError(errorText)) {
      throw new OpenRouterBusyError(`Provider error (${response.status}): ${errorText}`);
    }
    throw new Error(`OpenRouter request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    // Some free models (the nvidia ones) return whitespace instead of JSON
    // content. Treat that as unavailable so the next batch is tried.
    throw new OpenRouterBusyError(`Empty response from ${data?.model ?? batch[0]}`);
  }

  if (data?.model && data.model !== batch[0]) {
    console.info(`openrouter: ${batch[0]} unavailable, served by ${data.model}`);
  }
  return content.trim();
}

export async function getChatCompletion(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const chain = resolveModelChain();

  // OpenRouter caps `models` at 3 per request, so a longer chain is walked as
  // consecutive batches under one shared deadline — the visitor waits for the
  // whole chain, not for each batch in turn.
  const batches: string[][] = [];
  for (let i = 0; i < chain.length; i += MAX_MODELS_PER_REQUEST) {
    batches.push(chain.slice(i, i + MAX_MODELS_PER_REQUEST));
  }

  const deadline = Date.now() + TOTAL_BUDGET_MS;
  let lastError: unknown;

  for (const batch of batches) {
    const remaining = deadline - Date.now();
    // Not enough time left to be worth starting another round trip.
    if (remaining < 3_000) break;

    try {
      return await attemptBatch(apiKey, batch, messages, Math.min(remaining, REQUEST_TIMEOUT_MS));
    } catch (error) {
      lastError = error;
      // Saturated pools and empty bodies are expected — move to the next batch.
      // A genuine fault (bad key, malformed request) is not worth retrying.
      const retryable =
        error instanceof OpenRouterBusyError ||
        (error instanceof Error && error.name === "TimeoutError");
      if (!retryable) throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new OpenRouterBusyError("All models in the chain were unavailable");
}
