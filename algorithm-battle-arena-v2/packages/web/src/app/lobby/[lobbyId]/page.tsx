"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProblemBrowserModal from "@/components/ProblemBrowserModal";
import LobbyChatSidebar from "@/components/chat/LobbyChatSidebar";
import { AppShell } from "@/components/shell/AppShell";
import { Card, Chip } from "@/components/primitives/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lobbiesApi, matchesApi } from "@/lib/api";
import { lobbySocket } from "@/lib/lobbySocket";
import { useAuth } from "@/lib/auth-context";
import { Crown, Copy, Loader2, LogOut, Play, Users, Settings, MessageCircle, XCircle, Shield, Swords } from "lucide-react";

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
  // Lobby settings are visible by default for the host
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!lobbyId) return;
    lobbiesApi.getById(parseInt(lobbyId)).then((r) => setLobby(r.data)).catch(() => {});
    lobbySocket.start();
    lobbySocket.joinLobby(lobbyId);
    const u1 = lobbySocket.onLobbyUpdated((l) => setLobby(l));
    const u2 = lobbySocket.onMatchStarted((dto) => router.push("/match/" + dto.matchId));
    const u3 = lobbySocket.onLobbyDeleted(() => router.push("/lobby"));
    return () => { u1(); u2(); u3(); lobbySocket.leaveLobby(lobbyId); };
  }, [lobbyId, router]);

  const isHost = lobby?.hostEmail === user?.email;

  const handleStart = async () => {
    if (!lobby || isStarting) return;
    if (selectedProblems.length === 0) {
      alert("Select at least one problem before starting the match.");
      return;
    }
    setIsStarting(true);
    try {
      const res = await matchesApi.start(lobby.lobbyId, { problemIds: selectedProblems.map((p: any) => p.problemId), durationSec: matchDuration });
      const nextMatchId = res.data?.matchId;
      if (typeof nextMatchId === "number") router.push(`/match/${nextMatchId}`);
    }
    catch (err: any) {
      setIsStarting(false);
      alert(err?.response?.data?.message || "Failed to start match");
    }
  };

  const handleLeave = async () => { await lobbiesApi.leave(parseInt(lobbyId)); router.push("/lobby"); };
  const handleKick = async (email: string) => { try { await lobbiesApi.kick(parseInt(lobbyId), email); } catch { alert("Failed to kick"); } };
  const handleDifficulty = async (d: string) => { try { await lobbiesApi.updateDifficulty(parseInt(lobbyId), d); } catch {} };
  const role = (user?.role || "Student").toLowerCase();
  const shellRole = role === "teacher" ? "teacher" : role === "admin" ? "admin" : "student";

  if (!lobby) {
    return (
      <ProtectedRoute>
        <AppShell role={shellRole} current="lobbyInstance">
          <div className="flex min-h-[calc(100vh-56px)] items-center justify-center bg-[var(--surface)]">
            <p className="animate-pulse font-display text-xl font-semibold text-primary">Loading lobby...</p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell role={shellRole} current="lobbyInstance">
      <div className="min-h-[calc(100vh-56px)] bg-[var(--surface)]">
        <div className="mx-auto max-w-5xl space-y-6 p-6">
          {/* Header */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">ARENA LOBBY</div>
              <h1 className="font-display text-[26px] font-semibold">{lobby.lobbyName}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="bg-white" onClick={() => navigator.clipboard.writeText(lobby.lobbyCode)}>
                <Copy className="size-4" /> {lobby.lobbyCode}
              </Button>
              <Button variant="outline" className="bg-white" onClick={() => setShowChat(!showChat)}>
                <MessageCircle className="size-4" /> Chat
              </Button>
               {isHost && (
                 <>
                   <Button onClick={handleStart} disabled={isStarting} className="bg-primary hover:bg-[#C62828]">
                     {isStarting ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                     {isStarting ? "Starting..." : "Start Match"}
                   </Button>
                 </>
               )}
              <Button variant="outline" className="border-destructive/30 bg-white text-destructive hover:bg-destructive/10" onClick={handleLeave}>
                <LogOut className="size-4" /> Leave
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {isHost && (
            <Card className="space-y-4 p-4">
              <div className="flex items-center gap-2 font-display font-semibold">
                <Settings className="size-4 text-primary" /> Lobby settings
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block font-mono text-[10px] tracking-widest text-muted-foreground">DIFFICULTY</label>
                  <select value={lobby.difficulty || "Medium"} onChange={(e) => handleDifficulty(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[10px] tracking-widest text-muted-foreground">DURATION (SECONDS)</label>
                  <Input type="number" value={matchDuration} onChange={(e) => setMatchDuration(parseInt(e.target.value) || 600)} />
                </div>
              </div>
              <Button onClick={() => setShowProblems(true)} disabled={isStarting} className="bg-primary hover:bg-[#C62828]">
                Select Problems ({selectedProblems.length})
              </Button>
            </Card>
          )}

          {/* Lobby Info */}
          <Card>
            <div className="flex flex-wrap gap-2 border-b border-border bg-gradient-to-br from-[#FFF8EF]/70 via-[#FFFEFB] to-[#F4E8D6]/40 px-4 py-3">
              <Chip tone="primary"><Swords className="size-3" /> {lobby.mode}</Chip>
              <Chip tone={lobby.difficulty === "Easy" ? "success" : lobby.difficulty === "Hard" ? "danger" : "warning"}>{lobby.difficulty}</Chip>
              <Chip tone={lobby.status === "Open" ? "success" : "tension"}>{lobby.status}</Chip>
            </div>

            {/* Participants */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 font-display font-semibold">
                <Users className="size-4 text-primary" /> Participants
              </div>
              <Chip tone="neutral">{lobby.participants?.length ?? 0}/{lobby.maxPlayers}</Chip>
            </div>
            <div className="divide-y divide-border">
              {lobby.participants?.map((p: any) => (
                <div key={p.email} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30">
                  <div className="flex items-center gap-2">
                    {p.email === lobby.hostEmail && <Crown className="size-4 text-[#F6C445]" />}
                    <span className="text-sm font-medium">{p.name || p.email}</span>
                    {p.email === lobby.hostEmail && <Chip tone="primary"><Shield className="size-3" /> Host</Chip>}
                  </div>
                  {isHost && p.email !== lobby.hostEmail && (
                    <button onClick={() => handleKick(p.email)} className="rounded-md p-1 text-destructive hover:bg-destructive/10"><XCircle size={16} /></button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <ProblemBrowserModal isOpen={showProblems} onClose={() => setShowProblems(false)} onAddProblems={setSelectedProblems} />
        {showChat && <LobbyChatSidebar lobbyId={lobbyId} isOpen={showChat} onToggle={() => setShowChat(!showChat)} currentUserEmail={user?.email || ""} />}
      </div>
      </AppShell>
    </ProtectedRoute>
  );
}
