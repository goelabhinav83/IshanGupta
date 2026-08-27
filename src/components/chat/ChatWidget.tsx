"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage as ChatMessageType } from "@/lib/openrouter";
import ChatMessage from "@/components/chat/ChatMessage";
import { doctor } from "@/content/doctor";

const GREETING: ChatMessageType = {
  role: "assistant",
  content: `Hi, I'm the FAQ assistant for ${doctor.name}'s practice. I can help with questions about his background, conditions treated, procedures, languages, clinic location, or how to book. I can't give medical advice — for that, please request an appointment or message us on WhatsApp.`,
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text } as ChatMessageType];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.filter((m) => m !== GREETING) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please try WhatsApp or email instead.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
        aria-expanded={open}
        className="fixed bottom-[88px] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-teal-900 text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-900 sm:bottom-[104px] sm:right-6"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path
              d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5V16H5.5A1.5 1.5 0 0 1 4 14.5v-9Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Practice FAQ chat"
          className="fixed bottom-[156px] right-5 z-40 flex h-[min(30rem,60vh)] w-[min(22.5rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-teal-900/10 bg-paper shadow-2xl shadow-black/20 sm:bottom-[172px] sm:right-6"
        >
          <div className="bg-teal-900 px-4 py-3">
            <p className="text-sm font-semibold text-white">Practice FAQ Assistant</p>
            <p className="text-xs text-white/70">Not a substitute for medical advice</p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <ChatMessage key={i} message={m} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <p className="rounded-2xl rounded-bl-md bg-mist px-4 py-2.5 text-sm text-ink/60">
                  Typing…
                </p>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-teal-900/10 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about hours, location, conditions…"
              aria-label="Message"
              className="min-w-0 flex-1 rounded-full border border-teal-900/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral text-white disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M3 11.5 20.5 3l-5 17.5-4.5-7-8-2Z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
