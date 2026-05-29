"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { statisticsApi, friendsApi, studentsApi } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import ContactsSection from "@/components/chat/ContactsSection";
import ChatButton from "@/components/chat/ChatButton";
import ChatWindow from "@/components/chat/ChatWindow";
import Link from "next/link";
import { Trophy, Swords, Target, Star, Users, LogOut, PlayCircle, Medal, UserPlus } from "lucide-react";

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #ff6b00", borderRadius: "6px", padding: "20px", boxShadow: "0 0 15px rgba(255,107,0,0.3)" }}
    className="flex items-center space-x-4">
    <div style={{ color: "#ffed4e" }}>{icon}</div>
    <div>
      <p style={{ fontFamily: "'Courier New', monospace", fontSize: "1.1rem", color: "#ccc", letterSpacing: "0.1em" }}>{label}</p>
      <p style={{ fontFamily: "'MK4', Impact, sans-serif", fontSize: "2.5rem", color: "#ffed4e", textShadow: "0 0 10px rgba(255,237,78,0.5), 2px 2px 0px #000" }}>{value}</p>
    </div>
  </div>
);

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [teacherRequestId, setTeacherRequestId] = useState<number | undefined>();

  useEffect(() => {
    statisticsApi.getUserStats().then((r) => setStats(r.data)).catch(() => {});
    friendsApi.getFriends().then((r) => setFriends(r.data || [])).catch(() => {});
    studentsApi.getTeachers().then((r) => setTeachers(r.data || [])).catch(() => {});
  }, []);

  const handleRequestTeacher = async () => {
    if (!teacherRequestId) return;
    try { await studentsApi.requestTeacher(teacherRequestId); alert("Teacher request sent!"); } catch { alert("Failed to send request"); }
  };

  return (
    <ProtectedRoute allowedRoles={["Student"]}>
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #111827 0%, #1a0000 50%, #000 100%)" }}>
        {/* Header */}
        <header className="p-6 flex items-center justify-between" style={{ borderBottom: "2px solid #ff6b00" }}>
          <h1 className="select-none" style={{ fontFamily: "'MK4', Impact, sans-serif", fontSize: "2.5rem", color: "#ffed4e", textShadow: "3px 3px 0px #ff6b00, 6px 6px 0px #000" }}>
            STUDENT DASHBOARD
          </h1>
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "'Courier New', monospace", color: "#ccc" }}>{user?.email}</span>
            <button onClick={logout} className="flex items-center gap-1 px-4 py-2 rounded-lg" style={{ background: "#6B0F1A", color: "#fff", border: "2px solid #4a0a0e" }}>
              <LogOut size={16} /> LOGOUT
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            {[{ key: "dashboard", label: "Dashboard" }, { key: "contacts", label: "Friends & Chat" }, { key: "teacher", label: "Teacher" }].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className="px-4 py-2 rounded-lg font-bold transition-all"
                style={{
                  background: activeTab === key ? "linear-gradient(135deg, #ff6b00, #ff4d4d)" : "rgba(40,40,40,0.9)",
                  color: activeTab === key ? "#fff" : "#999", border: activeTab === key ? "2px solid #ffed4e" : "2px solid #666",
                  fontFamily: "'Courier New', monospace", letterSpacing: "0.05em",
                }}>{label}</button>
            ))}
          </div>

          {activeTab === "dashboard" && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={<Trophy size={32} />} label="RANK" value={stats?.rank ?? "-"} />
                <StatCard icon={<Swords size={32} />} label="MATCHES" value={stats?.matchesPlayed ?? 0} />
                <StatCard icon={<Target size={32} />} label="WIN RATE" value={`${(stats?.winRate ?? 0).toFixed(0)}%`} />
                <StatCard icon={<Star size={32} />} label="SCORE" value={stats?.totalScore ?? 0} />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { href: "/host-battle", icon: <Swords size={24} />, label: "HOST BATTLE" },
                  { href: "/lobby", icon: <Users size={24} />, label: "JOIN LOBBY" },
                  { href: "/leaderboard", icon: <Medal size={24} />, label: "LEADERBOARD" },
                  { href: "/create-challenge", icon: <PlayCircle size={24} />, label: "CREATE CHALLENGE" },
                ].map(({ href, icon, label }) => (
                  <Link key={href} href={href}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg text-center transition-all hover:scale-105"
                    style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #666", boxShadow: "0 0 10px rgba(255,107,0,0.2)" }}>
                    <div style={{ color: "#ff6b00" }}>{icon}</div>
                    <span style={{ fontFamily: "'Courier New', monospace", color: "#ffed4e", fontSize: "0.8rem", letterSpacing: "0.1em" }}>{label}</span>
                  </Link>
                ))}
              </div>

              {/* Friends sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl p-4" style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #ff6b00" }}>
                  <h3 style={{ fontFamily: "'Courier New', monospace", color: "#ffed4e", fontWeight: "bold", marginBottom: "12px" }}>RECENT ACTIVITY</h3>
                  <p style={{ fontFamily: "'Courier New', monospace", color: "#999" }}>Your match history and submissions will appear here.</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #ff6b00" }}>
                  <h3 style={{ fontFamily: "'Courier New', monospace", color: "#ffed4e", fontWeight: "bold", marginBottom: "12px" }}>FRIENDS ({friends.length})</h3>
                  {friends.length === 0 ? <p className="text-gray-500 text-sm">No friends yet</p> : (
                    <div className="space-y-2">
                      {friends.slice(0, 5).map((f: any) => (
                        <div key={f.studentId} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                          <div className={`w-2 h-2 rounded-full ${f.isOnline ? "bg-green-400" : "bg-gray-600"}`} />
                          <span className="text-white text-sm">{f.fullName || f.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "contacts" && <ContactsSection />}

          {activeTab === "teacher" && (
            <div className="max-w-2xl space-y-6">
              <div className="rounded-xl p-6" style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #ff6b00" }}>
                <h3 className="mb-4" style={{ fontFamily: "'Courier New', monospace", color: "#ffed4e", fontWeight: "bold" }}>REQUEST A TEACHER</h3>
                <div className="flex gap-2">
                  <select value={teacherRequestId ?? ""} onChange={(e) => setTeacherRequestId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="flex-1 px-4 py-3 rounded-lg text-white" style={{ background: "rgba(40,40,40,0.9)", border: "2px solid #666", fontFamily: "'Courier New', monospace" }}>
                    <option value="">Select a teacher...</option>
                    {teachers.map((t: any) => <option key={t.teacherId} value={t.teacherId}>{t.firstName} {t.lastName}</option>)}
                  </select>
                  <button onClick={handleRequestTeacher} disabled={!teacherRequestId}
                    className="px-6 py-3 rounded-lg font-bold disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #ff6b00, #ff4d4d)", color: "#fff", fontFamily: "'Courier New', monospace" }}>
                    <UserPlus size={16} className="inline mr-1" /> Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <ChatButton onClick={() => setShowChat(true)} />
        <ChatWindow isOpen={showChat} onClose={() => setShowChat(false)} />
      </div>
    </ProtectedRoute>
  );
}

