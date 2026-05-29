"use client";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { chatApi } from "@/lib/api";

interface Props {
  user: { studentId?: number; teacherId?: number; email: string };
  onChatStart?: (conversationId: number) => void;
  className?: string;
}

export default function ChatIcon({ user, onChatStart, className = "" }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await chatApi.createFriendConversation({
        friendId: user.studentId || user.teacherId,
        friendEmail: user.email,
      });
      if (res.data && onChatStart) onChatStart(res.data.conversationId);
    } catch (err) {
      console.error("Failed to start chat:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={loading}
      className={`p-1 rounded hover:bg-gray-700 transition-colors ${loading ? "opacity-50" : ""} ${className}`} title="Chat">
      <MessageCircle size={16} className="text-blue-400" />
    </button>
  );
}

