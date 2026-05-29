"use client";
import { Users, User, Trophy, MessageCircle } from "lucide-react";

interface Conversation {
  conversationId: number;
  type: string;
  referenceId?: number | null;
  participants?: string[];
  lastMessage?: { content: string } | null;
}

interface Props {
  conversations: Conversation[];
  activeConversation: number | null;
  onSelectConversation: (id: number) => void;
}

export default function ConversationList({ conversations, activeConversation, onSelectConversation }: Props) {
  const getIcon = (type: string) => {
    switch (type) {
      case "Friend": case "TeacherStudent": return <User size={16} />;
      case "Lobby": return <Users size={16} />;
      case "Match": return <Trophy size={16} />;
      default: return <MessageCircle size={16} />;
    }
  };

  const getName = (c: Conversation) => {
    if (c.type === "Friend" || c.type === "TeacherStudent") {
      return c.participants?.find((p) => p !== "current-user") || `${c.type} Chat`;
    }
    return `${c.type} #${c.referenceId || c.conversationId}`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-bold" style={{ color: "#ffed4e", fontFamily: "'Courier New', monospace" }}>Conversations</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((c) => (
          <div
            key={c.conversationId}
            onClick={() => onSelectConversation(c.conversationId)}
            className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors ${
              activeConversation === c.conversationId ? "bg-arena-orange/20 border-l-2 border-l-arena-orange" : ""
            }`}
          >
            <div className="flex items-center gap-2 text-sm">
              <span style={{ color: "#ff6b00" }}>{getIcon(c.type)}</span>
              <span className="font-medium text-gray-200">{getName(c)}</span>
            </div>
            {c.lastMessage && <p className="text-xs text-gray-500 mt-1 truncate">{c.lastMessage.content}</p>}
          </div>
        ))}
        {conversations.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No conversations yet</p>}
      </div>
    </div>
  );
}

