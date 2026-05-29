"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { MessageCircle, X } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface Props { matchId: string | number; isOpen: boolean; onToggle: () => void; currentUserEmail: string; }

export default function MatchChatPanel({ matchId, isOpen, onToggle, currentUserEmail }: Props) {
  const { conversations, messages, joinConversation, sendMessage, leaveConversation } = useChat();
  const matchConv = useMemo(() => conversations.find((c: any) => c.type === "Match" && c.referenceId === parseInt(String(matchId))), [conversations, matchId]);
  const [convId, setConvId] = useState<number | null>(null);

  useEffect(() => {
    if (matchConv) {
      setConvId(matchConv.conversationId);
      joinConversation(matchConv.conversationId);
    }
    return () => { if (matchConv) leaveConversation(matchConv.conversationId); };
  }, [matchConv]);

  const handleSend = useCallback((content: string) => { if (convId) sendMessage(convId, content); }, [convId, sendMessage]);

  if (!isOpen) {
    return (
      <button onClick={onToggle} className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50">
        <MessageCircle size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 flex flex-col rounded-lg shadow-xl z-50 overflow-hidden"
      style={{ background: "rgba(20, 20, 20, 0.95)", border: "2px solid #666" }}>
      <div className="p-3 border-b border-gray-700 flex justify-between items-center">
        <span style={{ color: "#ffed4e", fontFamily: "'Courier New', monospace", fontWeight: "bold", fontSize: "0.85rem" }}>Match Chat</span>
        <button onClick={onToggle} className="text-gray-400 hover:text-white"><X size={16} /></button>
      </div>
      {convId ? (
        <>
          <MessageList messages={messages[convId] ?? []} currentUserEmail={currentUserEmail} />
          <MessageInput onSendMessage={handleSend} />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">No match chat available</div>
      )}
    </div>
  );
}

