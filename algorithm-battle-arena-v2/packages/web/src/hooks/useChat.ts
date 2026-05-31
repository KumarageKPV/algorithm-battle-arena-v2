"use client";

import { useState, useEffect, useCallback } from "react";
import { chatSocket } from "@/lib/chatSocket";
import { chatApi } from "@/lib/api";

interface Message {
  messageId: number;
  conversationId: number;
  senderEmail: string;
  senderName: string;
  content: string;
  sentAt: string;
}

interface Conversation {
  conversationId: number;
  type: string;
  referenceId: number | null;
  participants: string[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

function dedupeConversations(conversations: Conversation[]) {
  const byId = new Map<number, Conversation>();

  conversations.forEach((conversation) => {
    const existing = byId.get(conversation.conversationId);
    if (!existing || new Date(conversation.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
      byId.set(conversation.conversationId, conversation);
    }
  });

  return Array.from(byId.values());
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const appendMessage = useCallback((msg: Message) => {
    setMessages((prev) => {
      const current = prev[msg.conversationId] || [];
      if (current.some((m) => m.messageId === msg.messageId)) return prev;
      return {
        ...prev,
        [msg.conversationId]: [...current, msg],
      };
    });
  }, []);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await chatApi.getConversations();
      setConversations(dedupeConversations(res.data || []));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!chatSocket.isConnected) {
      chatSocket.start();
    }

    loadConversations().catch((err) => console.error("Failed to load conversations", err));

    const unsub = chatSocket.onReceiveMessage((msg: Message) => appendMessage(msg));

    return () => {
      unsub();
    };
  }, [appendMessage, loadConversations]);

  const joinConversation = useCallback(async (convId: number) => {
    setActiveConversation(convId);
    chatSocket.joinConversation(convId);
    try {
      const res = await chatApi.getMessages(convId);
      setMessages((prev) => ({ ...prev, [convId]: (res.data as Message[]).reverse() }));
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  }, []);

  const leaveConversation = useCallback((convId: number) => {
    chatSocket.leaveConversation(convId);
    if (activeConversation === convId) {
      setActiveConversation(null);
    }
  }, [activeConversation]);

  const sendMessage = useCallback(async (convId: number, content: string) => {
    try {
      const res = await chatApi.sendMessage(convId, content);
      if (res.data?.messageId) appendMessage(res.data);
      loadConversations().catch(() => {});
    } catch (err) {
      console.error("Failed to send message", err);
    }
  }, [appendMessage, loadConversations]);

  const createFriendConversation = useCallback(async (friendId: number, friendEmail: string) => {
    const res = await chatApi.createFriendConversation({ friendId, friendEmail });
    return res.data;
  }, []);

  return {
    conversations,
    messages,
    activeConversation,
    loading,
    loadConversations,
    joinConversation,
    leaveConversation,
    sendMessage,
    createFriendConversation,
  };
}
