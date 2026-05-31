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
  }, [activeConvId, leaveConversation]);

  const handleSend = useCallback((content: string) => {
    if (activeConvId) sendMessage(activeConvId, content);
  }, [activeConvId, sendMessage]);

  if (!isOpen) {
    return (
      <button onClick={onToggle} className="fixed right-4 top-1/2 z-40 -translate-y-1/2 rounded-l-lg bg-primary p-3 text-primary-foreground shadow-lg hover:bg-primary/90">
        <MessageCircle size={20} />
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-border bg-white shadow-[0_24px_60px_-30px_rgba(30,27,26,0.3)]">
      <div className="flex items-center justify-between border-b border-border p-3">
        <span className="font-display font-semibold">Lobby Chat</span>
        <button onClick={onToggle} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><X size={18} /></button>
      </div>
      {activeConvId ? (
        <>
          <MessageList messages={messages[activeConvId] ?? []} currentUserEmail={currentUserEmail} />
          <MessageInput onSendMessage={handleSend} />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading chat...</div>
      )}
    </div>
  );
}
