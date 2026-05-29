import React, { useState, useEffect } from 'react';
import { MessageCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';
import apiService from '../services/api';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../services/auth';

const InlineChatWindow = ({ conversationId, currentUserEmail, onSendMessage, messages }) => {
  const [newMessage, setNewMessage] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };
  
  return (
    <div className="mt-3 bg-white/5 rounded-xl border border-white/20 overflow-hidden shadow-lg">
      <div className="h-64 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p className="text-sm">Start your conversation...</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`flex ${message.senderEmail === currentUserEmail ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-xl text-sm shadow-md ${
                  message.senderEmail === currentUserEmail 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                    : 'bg-white/15 text-white border border-white/30'
                }`}>
                  {message.senderEmail !== currentUserEmail && (
                    <div className="text-xs text-gray-300 mb-1 font-medium">{message.senderName || message.senderEmail}</div>
                  )}
                  <div className="break-words">{message.content}</div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/20">
          <div className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-white/10 border border-white/30 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all text-sm"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white p-2 rounded-xl transition-all shadow-lg disabled:shadow-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ContactsSection = ({ studentId, friends = [] }) => {
  const { user } = useAuth();
  const [acceptedTeachers, setAcceptedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedChat, setExpandedChat] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const { messages, joinConversation, sendMessage, leaveConversation, createFriendConversation } = useChat();

  useEffect(() => {
    const fetchAcceptedTeachers = async () => {
      try {
        const response = await apiService.students.getAcceptedTeachers();
        const teachers = response.data;
        setAcceptedTeachers(teachers);
      } catch (error) {
        console.error('Error fetching accepted teachers:', error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchAcceptedTeachers();
    }
  }, [studentId]);

  const handleStartChat = async (contact, type) => {
    try {
      const contactKey = `${type}_${contact.studentId || contact.teacherId}`;
      
      if (expandedChat === contactKey) {
        if (activeConversationId) {
          leaveConversation(activeConversationId);
        }
        setExpandedChat(null);
        setActiveConversationId(null);
        return;
      }
      
      if (activeConversationId) {
        await leaveConversation(activeConversationId);
      }
      
      let conversationId;
      if (type === 'friend') {
        const conversation = await createFriendConversation(contact.studentId, contact.email);
        conversationId = conversation.conversationId;
      } else if (type === 'teacher') {
        const conversation = await createFriendConversation(contact.teacherId, contact.email);
        conversationId = conversation.conversationId;
      }
      
      setExpandedChat(contactKey);
      setActiveConversationId(conversationId);
      await joinConversation(conversationId);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const handleSendMessage = async (content) => {
    if (activeConversationId) {
      await sendMessage(activeConversationId, content);
    }
  };

  if (loading) return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-white/20 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center p-4 bg-white/5 rounded-lg">
              <div className="w-10 h-10 bg-white/20 rounded-full mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/20 rounded w-24 mb-2"></div>
                <div className="h-3 bg-white/20 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
        Contacts
      </h3>
      
      {/* Friends Section */}
      {friends.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-white mb-3">Friends</h4>
          <div className="space-y-2">
            {friends.map(friend => (
              <div key={friend.studentId}>
                <div 
                  onClick={() => handleStartChat(friend, 'friend')}
                  className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-xs">
                      {friend.firstName?.[0]}{friend.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-white">{friend.fullName}</h5>
                    <p className="text-sm text-gray-300">{friend.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${friend.isOnline ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                    {expandedChat === `friend_${friend.studentId}` ? 
                      <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                      <MessageCircle className="h-4 w-4 text-blue-400" />
                    }
                  </div>
                </div>
                
                {/* Chat Window */}
                {expandedChat === `friend_${friend.studentId}` && activeConversationId && (
                  <InlineChatWindow
                    conversationId={activeConversationId}
                    currentUserEmail={user?.email}
                    onSendMessage={handleSendMessage}
                    messages={messages[activeConversationId] || []}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Teachers Section */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3">My Teachers</h4>
        {acceptedTeachers.length === 0 ? (
          <div className="text-center py-6">
            <MessageCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-300">No teachers connected yet</p>
            <p className="text-sm text-gray-400 mt-1">Send requests to teachers to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {acceptedTeachers.map(teacher => (
              <div key={teacher.teacherId}>
                <div 
                  onClick={() => handleStartChat(teacher, 'teacher')}
                  className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-xs">
                      {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-white">{teacher.fullName}</h5>
                    <p className="text-sm text-gray-300">{teacher.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    {expandedChat === `teacher_${teacher.teacherId}` ? 
                      <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                      <MessageCircle className="h-4 w-4 text-blue-400" />
                    }
                  </div>
                </div>
                
                {/* Chat Window */}
                {expandedChat === `teacher_${teacher.teacherId}` && activeConversationId && (
                  <InlineChatWindow
                    conversationId={activeConversationId}
                    currentUserEmail={user?.email}
                    onSendMessage={handleSendMessage}
                    messages={messages[activeConversationId] || []}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsSection;