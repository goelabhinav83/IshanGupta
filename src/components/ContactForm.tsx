"use client";

import { useState } from "react";
import { contact } from "@/content/doctor";
import Button from "@/components/ui/Button";

type Status = "idle" | "success" | "blocked";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [waHref, setWaHref] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const phone = String(data.get("phone") || "");
    const message = String(data.get("message") || "");

    const text = [
      "Hi Dr. Gupta, I'd like to request an appointment.",
      "",
      `Name: ${name}`,
      `Phone: ${phone || "—"}`,
      `Email: ${email}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const href = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(text)}`;
    const win = window.open(href, "_blank", "noopener,noreferrer");

    if (win) {
      setStatus("success");
      form.reset();
    } else {
      setWaHref(href);
      setStatus("blocked");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-teal-900/5 p-6 text-teal-900">
        <p className="font-medium">WhatsApp is opening in a new tab.</p>
        <p className="mt-1 text-sm text-ink/70">
          Your appointment request is pre-filled there — just hit send to reach Dr. Gupta.
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

      {status === "blocked" && waHref && (
        <p className="text-sm text-coral">
          Your browser blocked the WhatsApp pop-up.{" "}
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="underline">
            Tap here to open WhatsApp
          </a>{" "}
          instead, or message us at {contact.whatsappDisplay}.
        </p>
      )}

      <Button type="submit" variant="primary" className="w-full sm:w-auto">
        Send via WhatsApp
      </Button>
    </form>
  );
}
