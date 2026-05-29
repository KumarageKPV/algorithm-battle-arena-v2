"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProblemBrowserModal from "@/components/ProblemBrowserModal";
import LobbyChatSidebar from "@/components/chat/LobbyChatSidebar";
import { lobbiesApi, matchesApi } from "@/lib/api";
import { lobbySocket } from "@/lib/lobbySocket";
import { useAuth } from "@/lib/auth-context";
import { getToken } from "@/lib/tokenStorage";
import { Crown, Copy, LogOut, Play, Users, Settings, MessageCircle, XCircle } from "lucide-react";

export default function LobbyInstancePage() {
  const params = useParams();
  const lobbyId = params?.lobbyId as string;
  const { user } = useAuth();
  const router = useRouter();
  const [lobby, setLobby] = useState<any>(null);
  const [showProblems, setShowProblems] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState<any[]>([]);
  const [matchDuration, setMatchDuration] = useState(600);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!lobbyId) return;
    lobbiesApi.getById(parseInt(lobbyId)).then((r) => setLobby(r.data)).catch(() => {});
    const token = getToken();
    if (token) lobbySocket.start(token);
    lobbySocket.joinLobby(lobbyId);
    const u1 = lobbySocket.onLobbyUpdated((l) => setLobby(l));
    const u2 = lobbySocket.onMatchStarted((dto) => router.push("/match/" + dto.matchId));
    const u3 = lobbySocket.onLobbyDeleted(() => router.push("/lobby"));
    return () => { u1(); u2(); u3(); lobbySocket.leaveLobby(lobbyId); };
  }, [lobbyId, router]);

  const isHost = lobby?.hostEmail === user?.email;

  const handleStart = async () => {
    if (!lobby) return;
    try { await matchesApi.start(lobby.lobbyId, { problemIds: selectedProblems.map((p: any) => p.problemId), durationSec: matchDuration }); }
    catch { alert("Failed to start match"); }
  };

  const handleLeave = async () => { await lobbiesApi.leave(parseInt(lobbyId)); router.push("/lobby"); };
  const handleKick = async (email: string) => { try { await lobbiesApi.kick(parseInt(lobbyId), email); } catch { alert("Failed to kick"); } };
  const handleDifficulty = async (d: string) => { try { await lobbiesApi.updateDifficulty(parseInt(lobbyId), d); } catch {} };

  if (!lobby) return <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #111827 0%, #1a0000 50%, #000 100%)" }}><p style={{ color: "#ff6b00", fontFamily: "'MK4', Impact, sans-serif", fontSize: "1.5rem" }} className="animate-pulse">Loading lobby...</p></div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #111827 0%, #1a0000 50%, #000 100%)" }}>
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="select-none" style={{ fontFamily: "'MK4', Impact, sans-serif", fontSize: "2rem", color: "#ffed4e", textShadow: "2px 2px 0px #ff6b00, 4px 4px 0px #000" }}>
              {lobby.lobbyName}
            </h1>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(lobby.lobbyCode)}
                className="px-3 py-2 rounded-lg text-sm flex items-center gap-1" style={{ background: "rgba(40,40,40,0.9)", border: "1px solid #666", color: "#ccc", fontFamily: "'Courier New', monospace" }}>
                <Copy size={14} /> {lobby.lobbyCode}
              </button>
              <button onClick={() => setShowChat(!showChat)} className="px-3 py-2 rounded-lg text-sm flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white">
                <MessageCircle size={14} /> Chat
              </button>
              {isHost && (
                <>
                  <button onClick={() => setShowSettings(!showSettings)} className="px-3 py-2 rounded-lg text-sm flex items-center gap-1" style={{ background: "rgba(40,40,40,0.9)", border: "1px solid #666", color: "#ccc" }}>
                    <Settings size={14} /> Settings
                  </button>
                  <button onClick={handleStart} className="px-4 py-2 font-bold rounded-lg text-sm flex items-center gap-1" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff" }}>
                    <Play size={14} /> Start Match
                  </button>
                </>
              )}
              <button onClick={handleLeave} className="px-3 py-2 rounded-lg text-sm flex items-center gap-1" style={{ background: "#6B0F1A", color: "#fff", border: "2px solid #4a0a0e" }}>
                <LogOut size={14} /> Leave
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {isHost && showSettings && (
            <div className="mb-6 rounded-xl p-4 space-y-4" style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #ff6b00" }}>
              <h3 style={{ fontFamily: "'Courier New', monospace", color: "#ffed4e", fontWeight: "bold" }}>LOBBY SETTINGS</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: "#ccc", fontFamily: "'Courier New', monospace" }}>DIFFICULTY</label>
                  <select value={lobby.difficulty || "Medium"} onChange={(e) => handleDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-white" style={{ background: "rgba(40,40,40,0.9)", border: "2px solid #666" }}>
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: "#ccc", fontFamily: "'Courier New', monospace" }}>DURATION (seconds)</label>
                  <input type="number" value={matchDuration} onChange={(e) => setMatchDuration(parseInt(e.target.value) || 600)}
                    className="w-full px-3 py-2 rounded-lg text-white" style={{ background: "rgba(40,40,40,0.9)", border: "2px solid #666" }} />
                </div>
              </div>
              <button onClick={() => setShowProblems(true)} className="px-4 py-2 rounded-lg font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #ff6b00, #ff4d4d)", color: "#fff" }}>
                Select Problems ({selectedProblems.length})
              </button>
            </div>
          )}

          {/* Lobby Info */}
          <div className="rounded-xl p-6" style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #666" }}>
            <div className="flex gap-4 mb-4 text-sm" style={{ fontFamily: "'Courier New', monospace", color: "#999" }}>
              <span>Mode: <span className="text-white">{lobby.mode}</span></span>
              <span>Difficulty: <span className="text-white">{lobby.difficulty}</span></span>
              <span>Status: <span className="text-white">{lobby.status}</span></span>
            </div>

            {/* Participants */}
            <h3 className="mb-3 flex items-center gap-2" style={{ fontFamily: "'Courier New', monospace", color: "#ffed4e", fontWeight: "bold" }}>
              <Users size={18} /> WARRIORS ({lobby.participants?.length ?? 0}/{lobby.maxPlayers})
            </h3>
            <div className="space-y-2">
              {lobby.participants?.map((p: any) => (
                <div key={p.email} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(40,40,40,0.5)", border: "1px solid #444" }}>
                  <div className="flex items-center gap-2">
                    {p.email === lobby.hostEmail && <Crown size={16} style={{ color: "#ffed4e" }} />}
                    <span className="text-white">{p.name || p.email}</span>
                    {p.email === lobby.hostEmail && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#6B0F1A", color: "#ffed4e" }}>HOST</span>}
                  </div>
                  {isHost && p.email !== lobby.hostEmail && (
                    <button onClick={() => handleKick(p.email)} className="text-red-400 hover:text-red-300"><XCircle size={16} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <ProblemBrowserModal isOpen={showProblems} onClose={() => setShowProblems(false)} onAddProblems={setSelectedProblems} />
        {showChat && <LobbyChatSidebar lobbyId={lobbyId} isOpen={showChat} onToggle={() => setShowChat(!showChat)} currentUserEmail={user?.email || ""} />}
      </div>
    </ProtectedRoute>
  );
}