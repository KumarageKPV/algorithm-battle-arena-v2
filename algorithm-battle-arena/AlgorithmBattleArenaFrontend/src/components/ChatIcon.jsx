import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import apiService from '../services/api';

const ChatIcon = ({ user, onChatStart, className = "" }) => {
  const [loading, setLoading] = useState(false);

  const handleChatClick = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await apiService.chat.createFriendConversation(
        user.studentId || user.teacherId, 
        user.email
      );
      
      if (response.data && onChatStart) {
        onChatStart(response.data.conversationId);
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleChatClick}
      disabled={loading}
      className={`p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 ${className}`}
      title={`Chat with ${user.fullName || user.email}`}
    >
      <MessageCircle size={16} className={loading ? 'animate-pulse' : ''} />
    </button>
  );
};

export default ChatIcon;