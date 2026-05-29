"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { lobbiesApi } from "@/lib/api";

export default function HostBattlePage() {
  const [name, setName] = useState("");
  const [mode, setMode] = useState("1v1");
  const [difficulty, setDifficulty] = useState("Medium");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { const res = await lobbiesApi.create({ name, maxPlayers, mode, difficulty }); router.push(`/lobby/${res.data.lobbyId}`); }
    catch { alert("Failed to create lobby"); }
    finally { setLoading(false); }
  };

  const inputStyle = { background: "rgba(40,40,40,0.9)", border: "2px solid #666", fontFamily: "'Courier New', monospace", fontSize: "1rem" };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #111827 0%, #1a0000 50%, #000 100%)" }}>
        <div className="w-full max-w-md p-8 rounded-lg relative" style={{ background: "rgba(20,20,20,0.95)", border: "3px solid #ff6b00", boxShadow: "0 0 30px rgba(255,107,0,0.5)" }}>
          {/* Scanline */}
          <div className="absolute inset-0 pointer-events-none opacity-10 rounded-lg overflow-hidden">
            <div className="w-full h-full" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)" }} />
          </div>
          <h1 className="text-center mb-6 select-none relative z-10" style={{ fontFamily: "'MK4', Impact, sans-serif", fontSize: "2.5rem", color: "#ffed4e", textShadow: "3px 3px 0px #ff6b00, 6px 6px 0px #000" }}>
            HOST BATTLE
          </h1>
          <form onSubmit={handleCreate} className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm mb-1" style={{ color: "#ccc", fontFamily: "'Courier New', monospace" }}>LOBBY NAME</label>
              <input type="text" required placeholder="Lobby Name" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-white focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "#ccc", fontFamily: "'Courier New', monospace" }}>GAME MODE</label>
              <div className="grid grid-cols-3 gap-2">
                {["1v1", "2v2", "FFA"].map((m) => (
                  <button key={m} type="button" onClick={() => setMode(m)}
                    className="py-3 rounded-lg font-bold text-center transition-all"
                    style={{
                      background: mode === m ? "linear-gradient(135deg, #ff6b00, #ff4d4d)" : "rgba(40,40,40,0.9)",
                      border: mode === m ? "2px solid #ffed4e" : "2px solid #666",
                      color: mode === m ? "#fff" : "#999", fontFamily: "'Courier New', monospace",
                      boxShadow: mode === m ? "0 0 15px rgba(255,107,0,0.5)" : "none",
                    }}>{m}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "#ccc", fontFamily: "'Courier New', monospace" }}>DIFFICULTY</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-white focus:outline-none" style={inputStyle}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
            {mode !== "1v1" && (
              <div>
                <label className="block text-sm mb-1" style={{ color: "#ccc", fontFamily: "'Courier New', monospace" }}>MAX PLAYERS: {maxPlayers}</label>
                <input type="range" min={2} max={20} value={maxPlayers} onChange={(e) => setMaxPlayers(parseInt(e.target.value))} className="w-full accent-orange-500" />
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-lg font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #ff6b00, #ff4d4d)", color: "#fff", fontFamily: "'MK4', Impact, sans-serif", fontSize: "1.3rem", letterSpacing: "0.15em", boxShadow: "0 0 20px rgba(255,107,0,0.5)", border: "2px solid #ffed4e" }}>
              {loading ? "CREATING..." : "CREATE BATTLE"}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
