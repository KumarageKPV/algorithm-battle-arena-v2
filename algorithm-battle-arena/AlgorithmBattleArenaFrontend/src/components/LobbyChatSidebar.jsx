import { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const LobbyChatSidebar = ({ lobbyId, isOpen, onToggle }) => {
  const { user } = useAuth();
  const { conversations, messages, joinConversation, sendMessage, leaveConversation } = useChat();
  const [activeConversationId, setActiveConversationId] = useState(null);

  const lobbyConversation = useMemo(() => {
    return conversations.find(c => c.type === 'Lobby' && c.referenceId === parseInt(lobbyId));
  }, [conversations, lobbyId]);

  useEffect(() => {
    if (lobbyConversation && lobbyConversation.conversationId !== activeConversationId) {
      const join = async () => {
        setActiveConversationId(lobbyConversation.conversationId);
        await joinConversation(lobbyConversation.conversationId);
      };
      join();
    }
  }, [lobbyConversation, activeConversationId, joinConversation]);

  useEffect(() => {
    return () => {
      if (activeConversationId) {
        // best-effort leave on unmount
        leaveConversation(activeConversationId);
      }
    };
  }, []);

  const handleSendMessage = useCallback(async (content) => {
    if (activeConversationId) {
      await sendMessage(activeConversationId, content);
    }
  }, [activeConversationId, sendMessage]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-l-lg shadow-lg z-40 md:right-6"
      >
        <MessageCircle size={20} />
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-80 bg-white/10 backdrop-blur-sm border-l border-white/20 flex flex-col z-40">
      {/* Header */}
      <div className="p-4 border-b border-white/20 flex justify-between items-center">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <MessageCircle size={16} />
          Lobby Chat
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {activeConversationId ? (
        <>
          <MessageList
            messages={messages[activeConversationId] || []}
            currentUserEmail={user?.email}
          />
          <MessageInput onSendMessage={handleSendMessage} />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>Loading chat...</p>
        </div>
      )}
    </div>
  );
};

export default LobbyChatSidebar;