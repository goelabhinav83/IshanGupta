import type { ChatMessage as ChatMessageType } from "@/lib/openrouter";

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "rounded-br-md bg-teal-900 text-white"
            : "rounded-bl-md bg-mist text-ink"
        }`}
      >
        {message.content}
      </p>
    </div>
  );
}
