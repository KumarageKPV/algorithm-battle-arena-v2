import React, { useState, useEffect } from 'react';
import { MessageCircle, ChevronDown, ChevronUp, Send, Users } from 'lucide-react';
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

const TeacherContactsSection = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedChat, setExpandedChat] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const { messages, joinConversation, sendMessage, leaveConversation, createFriendConversation } = useChat();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Get students who have accepted this teacher
        const response = await apiService.students.getByStatus('accepted');
        setStudents(response.data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleStartChat = async (student) => {
    try {
      const studentKey = `student_${student.studentId}`;
      
      if (expandedChat === studentKey) {
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
      
      // Create conversation with student
      const conversation = await createFriendConversation(student.studentId, student.email);
      const conversationId = conversation.conversationId;
      
      setExpandedChat(studentKey);
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
        <MessageCircle className="w-5 h-5 mr-2 text-purple-400" />
        My Students ({students.length})
      </h3>
      
      {students.length === 0 ? (
        <div className="text-center py-6">
          <Users className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-300">No students connected yet</p>
          <p className="text-sm text-gray-400 mt-1">Students will appear here when they request you as their teacher</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map(student => (
            <div key={student.studentId}>
              <div 
                onClick={() => handleStartChat(student)}
                className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold text-xs">
                    {student.firstName?.[0]}{student.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-white">{student.fullName}</h5>
                  <p className="text-sm text-gray-300">{student.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  {expandedChat === `student_${student.studentId}` ? 
                    <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                    <MessageCircle className="h-4 w-4 text-purple-400" />
                  }
                </div>
              </div>
              
              {/* Chat Window */}
              {expandedChat === `student_${student.studentId}` && activeConversationId && (
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
  );
};

export default TeacherContactsSection;