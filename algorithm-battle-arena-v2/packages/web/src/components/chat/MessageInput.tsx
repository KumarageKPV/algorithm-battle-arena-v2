"use client";
import { useState } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="border-t border-gray-700 p-3">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 px-3 py-2 bg-arena-input border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-arena-orange disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="px-4 py-2 bg-arena-orange text-black rounded-lg hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-bold"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}

