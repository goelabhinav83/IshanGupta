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

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";

export type ChatRole = "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

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

export async function getChatCompletion(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
      temperature: 0.3,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`OpenRouter request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("OpenRouter returned an empty response");
  }

  return content.trim();
}
