"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import CreateLobbyModal from "@/components/CreateLobbyModal";
import { lobbiesApi } from "@/lib/api";
import { Plus, Users, LogIn } from "lucide-react";

export default function LobbyPage() {
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();

  useEffect(() => { lobbiesApi.getAll().then((r) => setLobbies(r.data)).catch(() => {}); }, []);

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    try { const res = await lobbiesApi.join(joinCode.trim()); router.push(`/lobby/${res.data.lobbyId}`); }
    catch { alert("Invalid lobby code"); }
  };

  const handleCreate = async (data: any) => {
    try { const res = await lobbiesApi.create(data); router.push(`/lobby/${res.data.lobbyId}`); }
    catch { alert("Failed to create lobby"); }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #111827 0%, #1a0000 50%, #000 100%)" }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="select-none" style={{ fontFamily: "'MK4', Impact, sans-serif", fontSize: "2.5rem", color: "#ffed4e", textShadow: "3px 3px 0px #ff6b00, 6px 6px 0px #000" }}>
              LOBBIES
            </h1>
            <div className="flex gap-3 items-center">
              <input placeholder="Enter code..." value={joinCode} onChange={(e) => setJoinCode(e.target.value)}
                className="px-3 py-2 rounded-lg text-white text-sm w-36" style={{ background: "rgba(40,40,40,0.9)", border: "2px solid #666", fontFamily: "'Courier New', monospace" }} />
              <button onClick={handleJoinByCode} className="px-4 py-2 font-bold rounded-lg text-sm flex items-center gap-1"
                style={{ background: "linear-gradient(135deg, #ff6b00, #ff4d4d)", color: "#fff" }}>
                <LogIn size={16} /> Join
              </button>
              <button onClick={() => setShowCreate(true)} className="px-4 py-2 font-bold rounded-lg text-sm flex items-center gap-1"
                style={{ background: "#6B0F1A", color: "#fff", border: "2px solid #4a0a0e" }}>
                <Plus size={16} /> Create Lobby
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lobbies.map((l: any) => (
              <div key={l.lobbyId} onClick={() => router.push(`/lobby/${l.lobbyId}`)}
                className="cursor-pointer p-5 rounded-lg transition-all hover:scale-[1.02]"
                style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #666", boxShadow: "0 0 10px rgba(255,107,0,0.2)" }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white">{l.lobbyName}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-green-900 text-green-400">{l.status}</span>
                </div>
                <div className="text-xs space-y-1" style={{ color: "#999", fontFamily: "'Courier New', monospace" }}>
                  <div>Host: {l.hostEmail}</div>
                  <div className="flex gap-3">
                    <span><Users size={12} className="inline mr-1" />{l.participants?.length ?? 0}/{l.maxPlayers}</span>
                    <span>{l.mode}</span>
                    <span>{l.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
            {lobbies.length === 0 && <p className="col-span-full text-center py-10" style={{ color: "#999", fontFamily: "'Courier New', monospace" }}>No open lobbies. Create one!</p>}
          </div>
        </div>

        <CreateLobbyModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      </div>
    </ProtectedRoute>
  );
}
