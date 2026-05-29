"use client";
import { MessageCircle } from "lucide-react";
interface ChatButtonProps {
  onClick: () => void;
  unreadCount?: number;
}
export default function ChatButton({ onClick, unreadCount = 0 }: ChatButtonProps) {
  return (
    <button onClick={onClick} className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-50">
      <MessageCircle size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
