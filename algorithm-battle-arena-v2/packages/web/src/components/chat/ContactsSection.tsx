"use client";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Send, Search, UserPlus, X, Check } from "lucide-react";
import { friendsApi } from "@/lib/api";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/lib/auth-context";
import ChatIcon from "./ChatIcon";

const InlineChatWindow = ({ currentUserEmail, onSendMessage, messages }: any) => {
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
                style={{ background: msg.senderEmail === currentUserEmail ? "linear-gradient(90deg, #ff6b00, #ff4d4d)" : "rgba(40,40,40,0.9)" }}>
                {msg.senderEmail !== currentUserEmail && <div className="text-xs mb-1 font-medium" style={{ color: "#ffed4e" }}>{msg.senderName || msg.senderEmail}</div>}
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

export default function ContactsSection() {
  const { user } = useAuth();
  const { messages, joinConversation, sendMessage, loadConversations } = useChat();
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [expandedFriend, setExpandedFriend] = useState<number | null>(null);
  const [chatConvId, setChatConvId] = useState<number | null>(null);

  useEffect(() => {
    friendsApi.getFriends().then((r) => setFriends(r.data || [])).catch(() => {});
    friendsApi.getReceived().then((r) => setRequests(r.data || [])).catch(() => {});
    loadConversations();
  }, [loadConversations]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try { const r = await friendsApi.search(searchQuery); setSearchResults(r.data || []); } catch { setSearchResults([]); }
  };

  const handleSendRequest = async (receiverId: number) => {
    try { await friendsApi.sendRequest(receiverId); setSearchResults((prev) => prev.filter((s) => s.studentId !== receiverId)); } catch (e) { console.error(e); }
  };

  const handleAccept = async (requestId: number) => {
    try { await friendsApi.accept(requestId); setRequests((prev) => prev.filter((r) => r.requestId !== requestId)); friendsApi.getFriends().then((r) => setFriends(r.data || [])); } catch (e) { console.error(e); }
  };

  const handleReject = async (requestId: number) => {
    try { await friendsApi.reject(requestId); setRequests((prev) => prev.filter((r) => r.requestId !== requestId)); } catch (e) { console.error(e); }
  };

  const handleChatStart = (convId: number) => {
    setChatConvId(convId);
    joinConversation(convId);
  };

  const toggleFriend = (friendId: number) => {
    setExpandedFriend(expandedFriend === friendId ? null : friendId);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="rounded-xl p-4" style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #ff6b00" }}>
        <h3 className="font-bold mb-3" style={{ color: "#ffed4e", fontFamily: "'Courier New', monospace" }}>Find Friends</h3>
        <div className="flex gap-2">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by name or email..." className="flex-1 px-3 py-2 rounded-lg text-sm text-white bg-white/10 border border-white/20 focus:outline-none focus:border-arena-orange" />
          <button onClick={handleSearch} className="px-3 py-2 bg-arena-orange text-black rounded-lg"><Search size={16} /></button>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2">
            {searchResults.map((s: any) => (
              <div key={s.studentId} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span className="text-sm text-white">{s.firstName} {s.lastName} <span className="text-gray-500 text-xs">{s.email}</span></span>
                <button onClick={() => handleSendRequest(s.studentId)} className="px-2 py-1 bg-green-600 text-white rounded text-xs"><UserPlus size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {requests.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #ff6b00" }}>
          <h3 className="font-bold mb-3" style={{ color: "#ffed4e", fontFamily: "'Courier New', monospace" }}>Friend Requests ({requests.length})</h3>
          <div className="space-y-2">
            {requests.map((r: any) => (
              <div key={r.requestId} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span className="text-sm text-white">{r.senderName || r.senderEmail}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleAccept(r.requestId)} className="p-1 bg-green-600 text-white rounded"><Check size={14} /></button>
                  <button onClick={() => handleReject(r.requestId)} className="p-1 bg-red-600 text-white rounded"><X size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="rounded-xl p-4" style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #ff6b00" }}>
        <h3 className="font-bold mb-3" style={{ color: "#ffed4e", fontFamily: "'Courier New', monospace" }}>Friends ({friends.length})</h3>
        {friends.length === 0 ? <p className="text-gray-500 text-sm">No friends yet. Search to add some!</p> : (
          <div className="space-y-2">
            {friends.map((f: any) => (
              <div key={f.studentId}>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10" onClick={() => toggleFriend(f.studentId)}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${f.isOnline ? "bg-green-400" : "bg-gray-600"}`} />
                    <span className="text-sm text-white">{f.fullName || f.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChatIcon user={{ studentId: f.studentId, email: f.email }} onChatStart={handleChatStart} />
                    {expandedFriend === f.studentId ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                  </div>
                </div>
                {expandedFriend === f.studentId && chatConvId && (
                  <InlineChatWindow conversationId={chatConvId} currentUserEmail={user?.email || ""} onSendMessage={(content: string) => sendMessage(chatConvId, content)} messages={messages[chatConvId] ?? []} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




