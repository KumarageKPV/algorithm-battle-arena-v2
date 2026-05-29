"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { statisticsApi } from "@/lib/api";
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  useEffect(() => { statisticsApi.getLeaderboard().then((r) => setEntries(r.data)).catch(() => {}); }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <span style={{ color: "#FFD700", fontSize: "1.2rem" }}>🥇</span>;
    if (rank === 2) return <span style={{ color: "#C0C0C0", fontSize: "1.2rem" }}>🥈</span>;
    if (rank === 3) return <span style={{ color: "#CD7F32", fontSize: "1.2rem" }}>🥉</span>;
    return null;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #111827 0%, #1a0000 50%, #000 100%)" }}>
        <div className="p-6">
          <h1 className="mb-8 flex items-center gap-3 select-none" style={{ fontFamily: "'MK4', Impact, sans-serif", fontSize: "2.5rem", color: "#ffed4e", textShadow: "3px 3px 0px #ff6b00, 6px 6px 0px #000" }}>
            <Trophy className="w-10 h-10" style={{ color: "#ffed4e" }} /> LEADERBOARD
          </h1>
          <div className="rounded-xl overflow-hidden" style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #ff6b00" }}>
            <table className="w-full text-left text-sm">
              <thead style={{ borderBottom: "2px solid #ff6b00" }}>
                <tr>
                  {["Rank", "Name", "Score", "Matches", "Win Rate", "Problems"].map((h) => (
                    <th key={h} className="px-4 py-3" style={{ color: "#ffed4e", fontFamily: "'Courier New', monospace", letterSpacing: "0.1em" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e: any, i: number) => (
                  <tr key={e.participantEmail} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                    style={i < 3 ? { background: "rgba(255,107,0,0.05)" } : undefined}>
                    <td className="px-4 py-3 font-bold flex items-center gap-2" style={{ color: "#ffed4e", fontFamily: "'MK4', Impact, sans-serif", fontSize: "1.2rem" }}>
                      {getRankIcon(e.rank ?? i + 1)} {e.rank ?? i + 1}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{e.fullName ?? e.participantEmail}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: "#ff6b00" }}>{e.totalScore}</td>
                    <td className="px-4 py-3 text-gray-400">{e.matchesPlayed}</td>
                    <td className="px-4 py-3 text-gray-400">{(e.winRate ?? 0).toFixed(0)}%</td>
                    <td className="px-4 py-3 text-gray-400">{e.problemsCompleted}</td>
                  </tr>
                ))}
                {entries.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: "#999", fontFamily: "'Courier New', monospace" }}>No data yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
