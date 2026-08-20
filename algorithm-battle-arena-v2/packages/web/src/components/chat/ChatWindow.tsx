"use client";
import { X } from "lucide-react";
import { useEffect } from "react";
import ConversationList from "./ConversationList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/lib/auth-context";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialConversationId?: number | null;
}

export default function ChatWindow({ isOpen, onClose, initialConversationId = null }: Props) {
  const { user } = useAuth();
  const { conversations, messages, activeConversation, sendMessage, joinConversation, leaveConversation, loadConversations } = useChat();

  useEffect(() => {
    if (isOpen) loadConversations();
  }, [isOpen, loadConversations]);

  const handleSelect = async (convId: number) => {
    if (activeConversation && activeConversation !== convId) leaveConversation(activeConversation);
    joinConversation(convId);
  };

  useEffect(() => {
    if (isOpen && initialConversationId && initialConversationId !== activeConversation) {
      handleSelect(initialConversationId);
    }
  }, [isOpen, initialConversationId]);

  if (!user || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className="w-full max-w-4xl h-[500px] flex rounded-xl overflow-hidden shadow-2xl"
        style={{ background: "rgba(20, 20, 20, 0.95)", border: "2px solid #ff6b00" }}
      >
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-800">
          <ConversationList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={handleSelect}
          />
        </div>

        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-gray-800">
            <h3 className="text-sm font-bold" style={{ color: "#ffed4e" }}>
              {activeConversation ? `Chat #${activeConversation}` : "Select a conversation"}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
          </div>

          {activeConversation ? (
            <>
              <MessageList messages={messages[activeConversation] ?? []} currentUserEmail={user.email} />
              <MessageInput onSendMessage={(content) => sendMessage(activeConversation, content)} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500" style={{ fontFamily: "'Courier New', monospace" }}>
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

