"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage as ChatMessageType } from "@/lib/openrouter";
import ChatMessage from "@/components/chat/ChatMessage";
import { doctor } from "@/content/doctor";

/**
 * A message as rendered in the widget. `transient` marks bubbles that exist
 * only in the UI (the greeting, connection errors) and must never be sent to
 * the model as conversation context.
 */
type UiMessage = ChatMessageType & { transient?: boolean };

/** Must stay below MAX_MESSAGES in the API route, which rejects longer histories. */
const MAX_HISTORY = 18;
/** Must match MAX_MESSAGE_LENGTH in the API route. */
const MAX_INPUT_LENGTH = 2000;

const GREETING: UiMessage = {
  role: "assistant",
  transient: true,
  content: `Hi, I'm the FAQ assistant for ${doctor.name}'s practice. I can help with questions about his background, conditions treated, procedures, languages, clinic location, or how to book. I can't give medical advice — for that, please request an appointment or message us on WhatsApp.`,
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  // Move focus into the panel when it opens so keyboard users land inside it.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Escape closes the panel and returns focus to the button that opened it.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: UiMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    // Send only real conversation turns, and only the most recent ones — the
    // API route rejects histories longer than its cap, and a rejected request
    // would otherwise leave the widget permanently stuck.
    const history = nextMessages
      .filter((m) => !m.transient)
      .slice(-MAX_HISTORY)
      .map(({ role, content }) => ({ role, content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      // Prefer the server's own wording — it distinguishes "busy, retry" from
      // a genuine outage. Fall back to the generic line for network failures.
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Sorry, I'm having trouble connecting right now. Please try WhatsApp or email instead.";
      setMessages((prev) => [...prev, { role: "assistant", transient: true, content: message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        ref={toggleRef}
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
          className="fixed bottom-[156px] right-5 z-40 flex max-h-[calc(100vh-172px)] h-[30rem] w-[min(22.5rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-teal-900/10 bg-paper shadow-2xl shadow-black/20 sm:bottom-[172px] sm:right-6 sm:max-h-[calc(100vh-188px)]"
        >
          <div className="flex items-start justify-between gap-3 bg-teal-900 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Practice FAQ Assistant</p>
              <p className="text-xs text-white/70">Not a substitute for medical advice</p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close chat"
              className="-mr-1 shrink-0 rounded-full p-1 text-white/70 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <ChatMessage key={i} message={m} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <p className="rounded-2xl rounded-bl-md bg-mist px-4 py-2.5 text-sm text-ink/70">
                  Typing…
                </p>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-teal-900/10 p-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={MAX_INPUT_LENGTH}
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
