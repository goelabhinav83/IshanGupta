import { NextRequest, NextResponse } from "next/server";
import { getChatCompletion, OpenRouterBusyError, type ChatMessage } from "@/lib/openrouter";

export const runtime = "nodejs";

/** Turns actually forwarded to the model. Longer histories are truncated, not rejected. */
const MAX_MESSAGES = 20;
/** Anything beyond this is treated as abuse rather than a stale client. */
const HARD_MAX_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 2000;

// Best-effort in-memory rate limit. Fluid Compute reuses instances across
// requests, so this meaningfully throttles a single abusive client, but it is
// per-instance rather than global — the authoritative spending ceiling is the
// credit limit on the OpenRouter key itself.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const hits = new Map<string, number[]>();

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map can't grow without bound.
  if (hits.size > 5_000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(k);
    }
  }

  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

function isValidHistory(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= HARD_MAX_MESSAGES &&
    value.every(
      (m) =>
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length > 0 &&
        m.content.length <= MAX_MESSAGE_LENGTH
    )
  );
}

export async function POST(request: NextRequest) {
  if (isRateLimited(clientKey(request))) {
    return NextResponse.json(
      { error: "Too many messages in a short time. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = (body as { messages?: unknown })?.messages;
  if (!isValidHistory(messages)) {
    return NextResponse.json({ error: "Invalid message history" }, { status: 400 });
  }

  try {
    const reply = await getChatCompletion(messages.slice(-MAX_MESSAGES));
    return NextResponse.json({ reply });
  } catch (error) {
    // Free model pools are shared and saturate regularly — that is expected
    // and transient, so ask the visitor to retry rather than implying a fault.
    if (error instanceof OpenRouterBusyError) {
      console.warn("chat route: all free models rate-limited");
      return NextResponse.json(
        {
          error:
            "The assistant is busy right now. Please try again in a moment — or message us on WhatsApp for a faster reply.",
        },
        { status: 503, headers: { "Retry-After": "30" } }
      );
    }
    console.error("chat route error:", error);
    return NextResponse.json(
      { error: "Sorry, the assistant is unavailable right now. Please try WhatsApp or email instead." },
      { status: 502 }
    );
  }
}
