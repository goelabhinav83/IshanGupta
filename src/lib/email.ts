import nodemailer from "nodemailer";
import { contact } from "@/content/doctor";

export type AppointmentRequest = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

export async function sendAppointmentRequest(data: AppointmentRequest): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD is not configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `Website <${user}>`,
    to: contact.email,
    replyTo: data.email,
    subject: `Appointment request from ${data.name}`,
    text: `New appointment request from the website.\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "—"}\n\nMessage:\n${data.message}`,
  });
}
