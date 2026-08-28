import type { ReactNode } from "react";

import type { ChatMessage as ChatMessageType } from "@/lib/openrouter";

/**
 * Every model in the fallback chain answers in Markdown — bold labels and
 * hyphen bullets — regardless of the system prompt, so rendering the reply as
 * plain text showed visitors literal `**Office Hours:**`. This is a deliberately
 * tiny renderer for the only two constructs that actually appear (bold spans
 * and bullet lists); it builds React nodes rather than HTML, so nothing the
 * model returns can inject markup.
 */
// The bold alternative is listed first so `**x**` never matches as italics.
const EMPHASIS = /\*\*(.+?)\*\*|\*(.+?)\*/g;
const BULLET = /^\s*[-*]\s+/;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(EMPHASIS)) {
    const start = match.index;
    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));
    nodes.push(
      match[1] !== undefined ? (
        <strong key={`${keyPrefix}-b${start}`}>{match[1]}</strong>
      ) : (
        <em key={`${keyPrefix}-i${start}`}>{match[2]}</em>
      )
    );
    lastIndex = start + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return nodes;
}

function renderMarkdown(content: string): ReactNode[] {
  const blocks: ReactNode[] = [];
  const lines = content.split("\n");
  let paragraph: string[] = [];
  let bullets: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join("\n");
    blocks.push(<p key={`p${blocks.length}`}>{renderInline(text, `p${blocks.length}`)}</p>);
    paragraph = [];
  };

  const flushBullets = () => {
    if (!bullets.length) return;
    const items = bullets;
    blocks.push(
      <ul key={`u${blocks.length}`} className="list-disc space-y-1 pl-5">
        {items.map((item, i) => (
          <li key={i}>{renderInline(item, `u${blocks.length}-${i}`)}</li>
        ))}
      </ul>
    );
    bullets = [];
  };

  for (const line of lines) {
    if (BULLET.test(line)) {
      flushParagraph();
      bullets.push(line.replace(BULLET, ""));
    } else if (!line.trim()) {
      flushBullets();
      flushParagraph();
    } else {
      flushBullets();
      paragraph.push(line);
    }
  }
  flushBullets();
  flushParagraph();

  return blocks;
}

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] space-y-2 rounded-2xl px-4 py-2.5 text-sm leading-relaxed [&_p]:whitespace-pre-wrap ${
          isUser
            ? "rounded-br-md bg-teal-900 text-white"
            : "rounded-bl-md bg-mist text-ink"
        }`}
      >
        {isUser ? <p className="whitespace-pre-wrap">{message.content}</p> : renderMarkdown(message.content)}
      </div>
    </div>
  );
}
