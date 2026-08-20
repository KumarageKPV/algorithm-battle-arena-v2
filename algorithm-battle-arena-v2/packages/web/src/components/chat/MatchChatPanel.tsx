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
  }, [matchConv, joinConversation, leaveConversation]);

  const handleSend = useCallback((content: string) => { if (convId) sendMessage(convId, content); }, [convId, sendMessage]);

  if (!isOpen) {
    return (
      <button onClick={onToggle} className="fixed bottom-4 right-4 z-50 rounded-full bg-primary p-3 text-primary-foreground shadow-lg hover:bg-primary/90">
        <MessageCircle size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-96 w-80 flex-col overflow-hidden rounded-lg border border-border bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-border p-3">
        <span className="font-display text-sm font-semibold">Match Chat</span>
        <button onClick={onToggle} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><X size={16} /></button>
      </div>
      {convId ? (
        <>
          <MessageList messages={messages[convId] ?? []} currentUserEmail={currentUserEmail} />
          <MessageInput onSendMessage={handleSend} />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">No match chat available</div>
      )}
    </div>
  );
}
