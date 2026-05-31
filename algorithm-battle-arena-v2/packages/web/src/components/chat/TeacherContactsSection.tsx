"use client";
import { useState, useEffect } from "react";
import { MessageCircle, ChevronDown, ChevronUp, Send, Users } from "lucide-react";
import { studentsApi } from "@/lib/api";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/lib/auth-context";
import ChatIcon from "./ChatIcon";

const InlineChatWindow = ({ conversationId, currentUserEmail, onSendMessage, messages }: any) => {
  const [newMessage, setNewMessage] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) { onSendMessage(newMessage.trim()); setNewMessage(""); }
  };
  return (
    <div className="mt-3 rounded-xl border overflow-hidden shadow-lg" style={{ background: "rgba(30,30,30,0.8)", borderColor: "rgba(255,255,255,0.2)" }}>
      <div className="h-64 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">Start your conversation...</div>
          ) : messages.map((msg: any, i: number) => (
            <div key={i} className={`flex ${msg.senderEmail === currentUserEmail ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs px-4 py-2 rounded-xl text-sm shadow-md ${msg.senderEmail === currentUserEmail ? "text-white" : "text-white border border-white/30"}`}
                style={{ background: msg.senderEmail === currentUserEmail ? "linear-gradient(90deg, #9333ea, #7c3aed)" : "rgba(40,40,40,0.9)" }}>
                {msg.senderEmail !== currentUserEmail && <div className="text-xs mb-1 font-medium text-gray-300">{msg.senderName || msg.senderEmail}</div>}
                <div className="break-words">{msg.content}</div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="p-3 border-t border-white/20 flex gap-2">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-lg text-sm text-white bg-white/10 border border-white/20 focus:outline-none focus:border-arena-orange" />
          <button type="submit" disabled={!newMessage.trim()} className="px-3 py-2 bg-arena-orange text-black rounded-lg disabled:opacity-50"><Send size={14} /></button>
        </form>
      </div>
    </div>
  );
};

export default function TeacherContactsSection() {
  const { user } = useAuth();
  const { conversations, messages, joinConversation, sendMessage, loadConversations } = useChat();
  const [students, setStudents] = useState<any[]>([]);
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);
  const [chatConvId, setChatConvId] = useState<number | null>(null);

  useEffect(() => {
    studentsApi.getStudents().then((r) => setStudents(r.data || [])).catch(() => {});
    loadConversations();
  }, [loadConversations]);

  const handleChatStart = (convId: number) => {
    setChatConvId(convId);
    joinConversation(convId);
  };

  const toggleStudent = (studentId: number) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #ff6b00" }}>
      <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: "#ffed4e", fontFamily: "'Courier New', monospace" }}>
        <Users size={18} /> My Students ({students.length})
      </h3>
      {students.length === 0 ? <p className="text-gray-500 text-sm">No students yet</p> : (
        <div className="space-y-2">
          {students.map((s: any) => (
            <div key={s.studentId || s.requestId}>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10"
                onClick={() => toggleStudent(s.studentId)}>
                <span className="text-sm text-white">{s.firstName} {s.lastName} <span className="text-gray-500 text-xs ml-1">{s.email}</span></span>
                <div className="flex items-center gap-1">
                  <ChatIcon user={{ studentId: s.studentId, email: s.email }} onChatStart={handleChatStart} />
                  {expandedStudent === s.studentId ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>
              </div>
              {expandedStudent === s.studentId && chatConvId && (
                <InlineChatWindow conversationId={chatConvId} currentUserEmail={user?.email || ""} onSendMessage={(content: string) => sendMessage(chatConvId, content)} messages={messages[chatConvId] ?? []} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

