"use client";
import { useState, useEffect } from "react";
import { studentsApi } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatButton from "@/components/chat/ChatButton";
import ChatWindow from "@/components/chat/ChatWindow";
import TeacherContactsSection from "@/components/chat/TeacherContactsSection";
import StudentAnalyticsPanel from "@/components/StudentAnalyticsPanel";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Crown, Users, BookOpen, Trophy, MessageCircle, LogOut } from "lucide-react";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    studentsApi.getDashboardStats().then((r) => setDashboardStats(r.data)).catch(() => {});
    studentsApi.getByStatus("Accepted").then((r) => setStudentCount(r.data?.length || 0)).catch(() => {});
  }, []);

  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "students", label: "Students" },
    { key: "analytics", label: "Analytics" },
    { key: "contacts", label: "Contacts" },
  ];

  return (
    <ProtectedRoute allowedRoles={["Teacher"]}>
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #111827 0%, #1a0000 50%, #000 100%)" }}>
        {/* Header */}
        <header className="p-6 flex items-center justify-between" style={{ borderBottom: "2px solid #ff6b00" }}>
          <div className="flex items-center gap-3">
            <Crown size={32} style={{ color: "#ffed4e" }} />
            <h1 className="select-none" style={{ fontFamily: "'MK4', Impact, sans-serif", fontSize: "2.5rem", color: "#ffed4e", textShadow: "3px 3px 0px #ff6b00, 6px 6px 0px #000" }}>
              TEACHER DASHBOARD
            </h1>
          </div>
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
            {tabs.map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className="px-4 py-2 rounded-lg font-bold transition-all"
                style={{
                  background: activeTab === key ? "linear-gradient(135deg, #ff6b00, #ff4d4d)" : "rgba(40,40,40,0.9)",
                  color: activeTab === key ? "#fff" : "#999", border: activeTab === key ? "2px solid #ffed4e" : "2px solid #666",
                  fontFamily: "'Courier New', monospace",
                }}>{label}</button>
            ))}
          </div>

          {activeTab === "dashboard" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {dashboardStats && [
                  { label: "Total Students", value: dashboardStats.totalStudents ?? studentCount },
                  { label: "Active Students", value: dashboardStats.activeStudents ?? 0 },
                  { label: "Total Submissions", value: dashboardStats.totalSubmissions ?? 0 },
                  { label: "Success Rate", value: `${(dashboardStats.overallSuccessRate ?? 0).toFixed(0)}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-5 text-center" style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #ff6b00", boxShadow: "0 0 15px rgba(255,107,0,0.3)" }}>
                    <div style={{ fontFamily: "'MK4', Impact, sans-serif", fontSize: "2.2rem", color: "#ffed4e", textShadow: "0 0 10px rgba(255,237,78,0.5)" }}>{value}</div>
                    <div style={{ fontFamily: "'Courier New', monospace", color: "#ccc", fontSize: "0.85rem", letterSpacing: "0.1em" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {dashboardStats && [
                  { href: "/manage-students", icon: <Users size={24} />, label: "Manage Students" },
                  { href: "/host-battle", icon: <Trophy size={24} />, label: "Host Battle" },
                  { href: "/create-challenge", icon: <BookOpen size={24} />, label: "Create Challenge" },
                  { href: "/teacher-chat", icon: <MessageCircle size={24} />, label: "Messages" },
                ].map(({ href, icon, label }) => (
                  <Link key={href} href={href}
                    className="flex flex-col items-center gap-2 p-5 rounded-lg transition-all hover:scale-105 text-center"
                    style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #666" }}>
                    <div style={{ color: "#ff6b00" }}>{icon}</div>
                    <span style={{ fontFamily: "'Courier New', monospace", color: "#ffed4e", fontSize: "0.85rem" }}>{label}</span>
                  </Link>
                ))}
              </div>
            </>
          )}

          {activeTab === "students" && (
            <div>
              <Link href="/manage-students" className="inline-block px-6 py-3 rounded-lg font-bold mb-4"
                style={{ background: "linear-gradient(135deg, #ff6b00, #ff4d4d)", color: "#fff", fontFamily: "'Courier New', monospace" }}>
                Manage Student Requests →
              </Link>
            </div>
          )}

          {activeTab === "analytics" && <StudentAnalyticsPanel />}
          {activeTab === "contacts" && <TeacherContactsSection />}
        </div>

        <ChatButton onClick={() => setShowChat(true)} />
        <ChatWindow isOpen={showChat} onClose={() => setShowChat(false)} />
      </div>
    </ProtectedRoute>
  );
}

