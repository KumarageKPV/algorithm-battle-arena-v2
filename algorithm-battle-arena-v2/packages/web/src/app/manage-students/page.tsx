"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { studentsApi } from "@/lib/api";

export default function ManageStudentsPage() {
  const [tab, setTab] = useState("Pending");
  const [students, setStudents] = useState<any[]>([]);
  useEffect(() => { studentsApi.getByStatus(tab).then((r) => setStudents(r.data || [])).catch(() => {}); }, [tab]);

  return (
    <ProtectedRoute allowedRoles={["Teacher"]}>
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #111827 0%, #1a0000 50%, #000 100%)" }}>
        <div className="p-6">
          <h1 className="mb-6 select-none" style={{ fontFamily: "'MK4', Impact, sans-serif", fontSize: "2.5rem", color: "#ffed4e", textShadow: "3px 3px 0px #ff6b00, 6px 6px 0px #000" }}>
            MANAGE STUDENTS
          </h1>
          <div className="flex gap-2 mb-6">
            {["Pending", "Accepted", "Rejected"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-lg font-bold transition-all"
                style={{
                  background: tab === t ? "linear-gradient(135deg, #ff6b00, #ff4d4d)" : "rgba(40,40,40,0.9)",
                  color: tab === t ? "#fff" : "#999", border: tab === t ? "2px solid #ffed4e" : "2px solid #666",
                  fontFamily: "'Courier New', monospace",
                }}>{t}</button>
            ))}
          </div>
          <div className="rounded-xl p-6" style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #ff6b00" }}>
            {students.length === 0 ? (
              <p style={{ color: "#999", fontFamily: "'Courier New', monospace" }}>No {tab.toLowerCase()} requests</p>
            ) : (
              <div className="space-y-2">
                {students.map((s: any) => (
                  <div key={s.requestId} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(40,40,40,0.5)", border: "1px solid #444" }}>
                    <span className="text-white">{s.firstName} {s.lastName} <span className="text-gray-500 text-xs ml-1">{s.email}</span></span>
                    {tab === "Pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => studentsApi.acceptRequest(s.requestId).then(() => setStudents((prev) => prev.filter((x) => x.requestId !== s.requestId)))}
                          className="px-3 py-1 rounded text-xs font-bold" style={{ background: "#22c55e", color: "#fff" }}>Accept</button>
                        <button onClick={() => studentsApi.rejectRequest(s.requestId).then(() => setStudents((prev) => prev.filter((x) => x.requestId !== s.requestId)))}
                          className="px-3 py-1 rounded text-xs font-bold" style={{ background: "#ef4444", color: "#fff" }}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
