"use client";
import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Message {
  messageId?: number;
  senderEmail: string;
  senderName?: string;
  content: string;
  sentAt?: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserEmail: string;
}

export default function MessageList({ messages, currentUserEmail }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg, i) => {
        const isOwn = msg.senderEmail === currentUserEmail;
        const showSender = i === 0 || messages[i - 1].senderEmail !== msg.senderEmail;
        return (
          <div key={msg.messageId ?? i} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
            <div className="max-w-xs">
              {showSender && !isOwn && (
                <div className="mb-1 px-3 font-mono text-[10px] text-muted-foreground">
                  {msg.senderName || msg.senderEmail}
                </div>
              )}
              <div
                className={`rounded-xl px-4 py-2 text-sm shadow-sm ${isOwn ? "bg-primary text-primary-foreground" : "border border-border bg-muted text-foreground"}`}
              >
                <p className="break-words">{msg.content}</p>
                {msg.sentAt && (
                  <p className="text-[10px] mt-1 opacity-60">{dayjs(msg.sentAt).fromNow()}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
