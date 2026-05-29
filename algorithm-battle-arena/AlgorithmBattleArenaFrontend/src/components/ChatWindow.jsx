import { X } from 'lucide-react';
import { useEffect } from 'react';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';

const ChatWindow = ({ isOpen, onClose, initialConversationId = null }) => {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    activeConversation,
    sendMessage,
    joinConversation,
    leaveConversation
  } = useChat();

  const handleSelectConversation = async (conversationId) => {
    if (activeConversation && activeConversation !== conversationId) {
      await leaveConversation(activeConversation);
    }
    await joinConversation(conversationId);
  };

  // Auto-join initial conversation if provided
  useEffect(() => {
    if (isOpen && initialConversationId && initialConversationId !== activeConversation) {
      handleSelectConversation(initialConversationId);
    }
  }, [isOpen, initialConversationId, activeConversation]);

  // Don't render if user is not authenticated
  if (!user || !isOpen) return null;

  const handleSendMessage = async (content) => {
    if (activeConversation) {
      await sendMessage(activeConversation, content);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-96 flex">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r">
          <ConversationList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">
              {activeConversation ? 'Chat' : 'Select a conversation'}
            </h3>
            <div className="flex items-center space-x-2">
              {activeConversation && (
                <button
                  onClick={async () => { await leaveConversation(activeConversation); }}
                  className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Exit Chat
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {activeConversation ? (
            <>
              <MessageList
                messages={messages[activeConversation] || []}
                currentUserEmail={user?.email}
              />
              <MessageInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;