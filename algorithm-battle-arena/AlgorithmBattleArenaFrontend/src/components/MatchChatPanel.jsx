import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const MatchChatPanel = ({ matchId, isOpen, onToggle }) => {
  const { user } = useAuth();
  const { conversations, messages, joinConversation, sendMessage, leaveConversation } = useChat();
  const [matchConversation, setMatchConversation] = useState(null);

  useEffect(() => {
    // Find match conversation
    const conv = conversations.find(c => c.type === 'Match' && c.referenceId === parseInt(matchId));
    if (conv) {
      setMatchConversation(conv);
      // join asynchronously without blocking render
      (async () => await joinConversation(conv.conversationId))();
    }

    return () => {
      if (conv) {
        // best-effort leave on unmount
        leaveConversation(conv.conversationId);
      }
    };
  }, [conversations, matchId, joinConversation, leaveConversation]);

  const handleSendMessage = async (content) => {
    if (matchConversation) {
      await sendMessage(matchConversation.conversationId, content);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50"
      >
        <MessageCircle size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-slate-800 border border-slate-600 rounded-lg flex flex-col shadow-xl z-50">
      {/* Header */}
      <div className="p-3 border-b border-slate-600 flex justify-between items-center">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <MessageCircle size={16} />
          Match Chat
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {matchConversation ? (
        <>
          <div className="flex-1 min-h-0">
            <MessageList
              messages={messages[matchConversation.conversationId] || []}
              currentUserEmail={user?.email}
            />
          </div>
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

export default MatchChatPanel;