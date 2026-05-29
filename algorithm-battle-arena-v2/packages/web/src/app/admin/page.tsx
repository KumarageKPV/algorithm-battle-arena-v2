"use client";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminUsersPanel from "@/components/AdminUsersPanel";
import AdminProblemsPanel from "@/components/AdminProblemsPanel";
import { useAuth } from "@/lib/auth-context";
import { Shield, Users, FileText, BarChart3, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #111827 0%, #2d0000 50%, #000 100%)" }}>
        {/* Header */}
        <header className="p-6 flex items-center justify-between" style={{ background: "rgba(0,0,0,0.5)", borderBottom: "2px solid rgba(239,68,68,0.3)" }}>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            <h1 className="text-2xl font-bold text-red-400">Guardian Command</h1>
          </div>
          <button onClick={logout} className="flex items-center gap-1 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-white">
            <LogOut size={16} /> Logout
          </button>
        </header>

        <main className="p-6 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">Arena Control Center</h2>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            {[
              { key: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
              { key: "users", label: "Users", icon: <Users size={16} /> },
              { key: "problems", label: "Problems", icon: <FileText size={16} /> },
            ].map(({ key, label, icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === key ? "bg-red-600 text-white" : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                }`}>{icon}{label}</button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Total Users", icon: <Users size={32} />, color: "blue" },
                { label: "Total Problems", icon: <FileText size={32} />, color: "green" },
                { label: "Active Matches", icon: <BarChart3 size={32} />, color: "purple" },
              ].map(({ label, icon }) => (
                <div key={label} className="rounded-xl p-6 text-center" style={{ background: "rgba(20,20,20,0.85)", border: "1px solid #333" }}>
                  <div className="mx-auto mb-3" style={{ color: "#ff6b00" }}>{icon}</div>
                  <h3 className="text-lg font-bold text-white mb-1">{label}</h3>
                  <p className="text-gray-400 text-sm">View the {label.toLowerCase()} tab for details</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "users" && <AdminUsersPanel />}
          {activeTab === "problems" && <AdminProblemsPanel />}
        </main>
      </div>
    </ProtectedRoute>
  );
}
