import { NextRequest, NextResponse } from "next/server";
import { getChatCompletion, type ChatMessage } from "@/lib/openrouter";

export const runtime = "nodejs";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

function isValidHistory(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= MAX_MESSAGES &&
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
    const reply = await getChatCompletion(messages);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("chat route error:", error);
    return NextResponse.json(
      { error: "Sorry, the assistant is unavailable right now. Please try WhatsApp or email instead." },
      { status: 502 }
    );
  }
}
