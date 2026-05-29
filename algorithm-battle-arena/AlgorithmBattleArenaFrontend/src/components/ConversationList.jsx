import { Users, User, Trophy, MessageCircle } from 'lucide-react';

const ConversationList = ({ conversations, activeConversation, onSelectConversation }) => {
  const getConversationIcon = (type) => {
    switch (type) {
      case 'Friend': return <User size={16} />;
      case 'Lobby': return <Users size={16} />;
      case 'Match': return <Trophy size={16} />;
      default: return <MessageCircle size={16} />;
    }
  };

  const getConversationName = (conversation) => {
    if (conversation.type === 'Friend') {
      return conversation.participants.find(p => p !== 'current-user') || 'Friend';
    }
    return `${conversation.type} #${conversation.referenceId || conversation.conversationId}`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-800">Conversations</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.conversationId}
            onClick={() => onSelectConversation(conversation.conversationId)}
            className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
              activeConversation === conversation.conversationId ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              {getConversationIcon(conversation.type)}
              <span className="font-medium text-sm">{getConversationName(conversation)}</span>
            </div>
            {conversation.lastMessage && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                {conversation.lastMessage.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;