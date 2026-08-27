"use client";

import { useState } from "react";
import { contact } from "@/content/doctor";
import Button from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const phone = String(data.get("phone") || "");
    const message = String(data.get("message") || "");

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-teal-900/5 p-6 text-teal-900">
        <p className="font-medium">Thank you — your appointment request is on its way.</p>
        <p className="mt-1 text-sm text-ink/70">
          We&rsquo;ll get back to you shortly. For a faster response, message us on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink/80">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-xl border border-teal-900/15 bg-paper px-4 py-3 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink/80">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="w-full rounded-xl border border-teal-900/15 bg-paper px-4 py-3 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink/80">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-teal-900/15 bg-paper px-4 py-3 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink/80">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder="Tell us briefly what you'd like to discuss."
          className="w-full resize-none rounded-xl border border-teal-900/15 bg-paper px-4 py-3 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-coral">
          Something went wrong sending your message. Please email {contact.email} or message us
          on WhatsApp instead.
        </p>
      )}

      <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
