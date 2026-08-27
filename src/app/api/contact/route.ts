import { NextRequest, NextResponse } from "next/server";
import { sendAppointmentRequest, type AppointmentRequest } from "@/lib/email";

export const runtime = "nodejs";

function isValidBody(value: unknown): value is AppointmentRequest {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === "string" &&
    v.name.trim().length > 0 &&
    v.name.length <= 200 &&
    typeof v.email === "string" &&
    v.email.trim().length > 0 &&
    v.email.length <= 200 &&
    typeof v.message === "string" &&
    v.message.trim().length > 0 &&
    v.message.length <= 4000 &&
    (v.phone === undefined || (typeof v.phone === "string" && v.phone.length <= 50))
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  try {
    await sendAppointmentRequest(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("contact route error:", error);
    return NextResponse.json(
      { error: "Sorry, we couldn't send your request. Please email us or message on WhatsApp instead." },
      { status: 502 }
    );
  }
}
