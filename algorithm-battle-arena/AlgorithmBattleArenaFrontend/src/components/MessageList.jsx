import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const MessageList = ({ messages, currentUserEmail }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 max-h-full">
      {messages.map((message, index) => {
        const isOwnMessage = message.senderEmail === currentUserEmail;
        const showSender = index === 0 || messages[index - 1].senderEmail !== message.senderEmail;
        
        return (
          <div
            key={message.messageId || index}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] sm:max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : 'order-2'}`}>
              {showSender && !isOwnMessage && (
                <div className="text-xs text-gray-500 mb-1 px-3">
                  {message.senderName || message.senderEmail}
                </div>
              )}
              <div
                className={`px-3 py-2 rounded-lg ${
                  isOwnMessage
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.sentAt ? dayjs(message.sentAt).fromNow() : 'Just now'}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;