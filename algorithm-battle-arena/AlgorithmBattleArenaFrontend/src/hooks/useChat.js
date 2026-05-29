import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import chatSignalR from '../services/chatSignalR';
import { getToken } from '../services/tokenStorage';

export const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.chat.getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages for conversation
  const loadMessages = useCallback(async (conversationId) => {
    try {
      const response = await api.chat.getMessages(conversationId);
      setMessages(prev => ({
        ...prev,
        [conversationId]: response.data.reverse()
      }));
    } catch (error) {
      console.error('Failed to load messages:', error);
      // Set empty array to prevent infinite loading states
      setMessages(prev => ({
        ...prev,
        [conversationId]: []
      }));
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (conversationId, content) => {
    try {
      await chatSignalR.sendMessage(conversationId, content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, []);

  // Join conversation
  const joinConversation = useCallback(async (conversationId) => {
    try {
      setActiveConversation(conversationId);
      await chatSignalR.joinConversation(conversationId);
      await loadMessages(conversationId);
    } catch (error) {
      console.error('Failed to join conversation:', error);
      setActiveConversation(null);
    }
  }, [loadMessages]);

  // Leave conversation
  const leaveConversation = useCallback(async (conversationId) => {
    try {
      await chatSignalR.leaveConversation(conversationId);
      if (activeConversation === conversationId) {
        setActiveConversation(null);
      }
    } catch (error) {
      console.error('Failed to leave conversation:', error);
      // Still update UI state even if SignalR call fails
      if (activeConversation === conversationId) {
        setActiveConversation(null);
      }
    }
  }, [activeConversation]);

  // Handle incoming messages
  useEffect(() => {
    const unsubscribe = chatSignalR.onReceiveMessage((message) => {
      if (message && message.conversationId) {
        setMessages(prev => ({
          ...prev,
          [message.conversationId]: [...(prev[message.conversationId] || []), message]
        }));
      }
    });

    return unsubscribe;
  }, []);

  // Initialize chat service
  useEffect(() => {
    const initializeChat = async () => {
      const token = getToken();
      if (!token) return;
      
      try {
        if (chatSignalR.connectionState === 'disconnected') {
          await chatSignalR.start();
        }
        await loadConversations();
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    };

    initializeChat();

    // Don't stop connection on unmount - keep it alive for global chat
  }, [loadConversations]);

  // Create friend conversation
  const createFriendConversation = useCallback(async (friendId, friendEmail) => {
    try {
      const response = await api.chat.createFriendConversation(friendId, friendEmail);
      await loadConversations(); // Refresh conversations list
      return response.data;
    } catch (error) {
      console.error('Failed to create friend conversation:', error);
      throw error;
    }
  }, [loadConversations]);

  return {
    conversations,
    messages,
    activeConversation,
    loading,
    sendMessage,
    joinConversation,
    leaveConversation,
    loadConversations,
    createFriendConversation
  };
};