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
      <div className="flex-1 flex items-center justify-center" style={{ fontFamily: "'Courier New', monospace", color: "#888" }}>
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
                <div className="text-xs mb-1 px-3" style={{ color: "#ffed4e", fontWeight: "bold" }}>
                  {msg.senderName || msg.senderEmail}
                </div>
              )}
              <div
                className="px-4 py-2 rounded-xl shadow-lg text-sm"
                style={{
                  fontFamily: "'Courier New', monospace",
                  background: isOwn ? "linear-gradient(90deg, #ff6b00, #ff4d4d)" : "rgba(40, 40, 40, 0.9)",
                  color: "#fff",
                  border: isOwn ? "none" : "1px solid #666",
                }}
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

