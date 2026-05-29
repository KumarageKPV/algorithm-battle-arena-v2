"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { MessageCircle, X } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface Props { lobbyId: string | number; isOpen: boolean; onToggle: () => void; currentUserEmail: string; }

export default function LobbyChatSidebar({ lobbyId, isOpen, onToggle, currentUserEmail }: Props) {
  const { conversations, messages, joinConversation, sendMessage, leaveConversation } = useChat();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);

  const lobbyConv = useMemo(() =>
    conversations.find((c: any) => c.type === "Lobby" && c.referenceId === parseInt(String(lobbyId))),
    [conversations, lobbyId]
  );

  useEffect(() => {
    if (lobbyConv && lobbyConv.conversationId !== activeConvId) {
      setActiveConvId(lobbyConv.conversationId);
      joinConversation(lobbyConv.conversationId);
    }
  }, [lobbyConv, activeConvId, joinConversation]);

  useEffect(() => {
    return () => { if (activeConvId) leaveConversation(activeConvId); };
  }, []);

  const handleSend = useCallback((content: string) => {
    if (activeConvId) sendMessage(activeConvId, content);
  }, [activeConvId, sendMessage]);

  if (!isOpen) {
    return (
      <button onClick={onToggle} className="fixed right-4 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-l-lg shadow-lg z-40">
        <MessageCircle size={20} />
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 flex flex-col z-40" style={{ background: "rgba(20, 20, 20, 0.95)", borderLeft: "2px solid #666" }}>
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <span style={{ color: "#ffed4e", fontFamily: "'Courier New', monospace", fontWeight: "bold" }}>Lobby Chat</span>
        <button onClick={onToggle} className="text-gray-400 hover:text-white"><X size={18} /></button>
      </div>
      {activeConvId ? (
        <>
          <MessageList messages={messages[activeConvId] ?? []} currentUserEmail={currentUserEmail} />
          <MessageInput onSendMessage={handleSend} />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Loading chat...</div>
      )}
    </div>
  );
}


