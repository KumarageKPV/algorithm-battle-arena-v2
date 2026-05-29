"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConversationList from "@/components/chat/ConversationList";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/lib/auth-context";

export default function TeacherChatPage() {
  const { user } = useAuth();
  const { conversations, messages, activeConversation, sendMessage, joinConversation, leaveConversation, loadConversations } = useChat();

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const handleSelect = (convId: number) => {
    if (activeConversation && activeConversation !== convId) leaveConversation(activeConversation);
    joinConversation(convId);
  };

  return (
    <ProtectedRoute allowedRoles={["Teacher"]}>
      <div className="h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #111827 0%, #1a0000 50%, #000 100%)" }}>
        <div className="p-4" style={{ borderBottom: "2px solid #ff6b00" }}>
          <h1 className="select-none" style={{ fontFamily: "'MK4', Impact, sans-serif", fontSize: "2rem", color: "#ffed4e", textShadow: "2px 2px 0px #ff6b00, 4px 4px 0px #000" }}>
            MESSAGES
          </h1>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80" style={{ borderRight: "2px solid #333", background: "rgba(15,15,15,0.9)" }}>
            <ConversationList conversations={conversations} activeConversation={activeConversation} onSelectConversation={handleSelect} />
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                <div className="p-3" style={{ borderBottom: "1px solid #333" }}>
                  <span style={{ fontFamily: "'Courier New', monospace", color: "#ffed4e", fontWeight: "bold" }}>Chat #{activeConversation}</span>
                </div>
                <MessageList messages={messages[activeConversation] ?? []} currentUserEmail={user?.email || ""} />
                <MessageInput onSendMessage={(content) => sendMessage(activeConversation, content)} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center" style={{ fontFamily: "'Courier New', monospace", color: "#666" }}>
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
