import { useEffect, useMemo, useState } from "react";
import { Card, Chip } from "../primitives/Bits";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, Swords, Filter, Users, Eye, ArrowRight, Flame, Plus, ArrowUpDown } from "lucide-react";
import { lobbiesApi } from "../../lib/api";
import CreateLobbyModal from "../CreateLobbyModal";

const FILTERS = ["All", "1v1", "Team", "Solo", "Ranked", "Casual"];

export function LobbyPage({ onEnter }: { onEnter: (lobbyId: number) => void }) {
  const [active, setActive] = useState("All");
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let activeRequest = true;
    const load = async () => {
      try {
        const res = await lobbiesApi.getAll();
        if (!activeRequest) return;
        setLobbies(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!activeRequest) return;
        setLobbies([]);
      } finally {
        if (activeRequest) setLoading(false);
      }
    };
    load();
    return () => {
      activeRequest = false;
    };
  }, []);

  const cards = useMemo(() => lobbies.map((lobby, index) => {
    const joined = lobby.participants?.length ?? 0;
    return {
      id: lobby.lobbyId ?? lobby.lobbyCode ?? index,
      lobbyId: lobby.lobbyId,
      lobbyCode: lobby.lobbyCode,
      title: lobby.lobbyName ?? "Open lobby",
      mode: lobby.mode ?? "1v1",
      challenge: lobby.difficulty ?? "Medium",
      difficulty: lobby.difficulty ?? "Medium",
      language: lobby.language ?? "Any",
      joined,
      capacity: lobby.maxPlayers ?? 0,
      status: lobby.status ?? "Open",
      host: lobby.hostEmail ?? "Host",
    };
  }), [lobbies]);

  const handleJoin = async (lobby: any) => {
    if (!lobby?.lobbyCode) return;
    setJoiningId(lobby.id);
    try {
      const res = await lobbiesApi.join(String(lobby.lobbyCode));
      const nextId = res.data?.lobbyId ?? lobby.lobbyId;
      if (typeof nextId === "number") {
        onEnter(nextId);
      }
    } catch {
      // noop
    } finally {
      setJoiningId(null);
    }
  };

  const handleCreate = async (data: { name: string; maxPlayers: number; mode: string; difficulty: string }) => {
    setCreating(true);
    try {
      const res = await lobbiesApi.create(data);
      const nextId = res.data?.lobbyId ?? res.data?.lobby?.lobbyId;
      if (typeof nextId === "number") {
        setShowCreate(false);
        onEnter(nextId);
      }
    } catch {
      // noop
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">ARENAS · OPEN LOBBIES</div>
          <h1 className="font-display text-[26px] font-semibold">Find your match</h1>
          <p className="text-sm text-muted-foreground">128 live · 24 filling · 6 starting in under a minute</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white"><Filter className="size-4" /> Filters</Button>
          <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-[#C62828]"><Plus className="size-4" /> Host battle</Button>
        </div>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search lobbies, challenges, hosts…" className="h-10 bg-[var(--input-background)] pl-9" />
          </div>
          <div className="flex flex-wrap gap-1">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setActive(f)} className={`h-8 rounded-md px-3 text-xs ${active === f ? "bg-primary text-white" : "text-foreground/70 hover:bg-muted"}`}>{f}</button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-xs text-muted-foreground">
            <ArrowUpDown className="size-3.5" /> Skill match
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(loading ? [] : cards).map(l => {
          const full = l.joined >= l.capacity && l.capacity > 0;
          const filling = l.capacity > 0 ? l.joined / l.capacity > 0.6 : false;
          const statusTone: any = l.status === "Live" ? "tension" : full ? "danger" : filling ? "warning" : "success";
          const diffTone: any = l.difficulty === "Easy" ? "success" : l.difficulty === "Medium" ? "warning" : "danger";
          return (
            <Card key={l.id} className="group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-center justify-between border-b border-border bg-gradient-to-br from-[#FFF8EF]/70 via-[#FFFEFB] to-[#F4E8D6]/40 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Chip tone="primary"><Swords className="size-3" />{l.mode}</Chip>
                  <Chip tone={diffTone}>{l.difficulty}</Chip>
                </div>
                <Chip tone={statusTone}>
                  {l.status === "Live" && <Flame className="size-3" />}
                  {l.status}
                </Chip>
              </div>

              <div className="p-4">
                <div className="font-display text-[15px] font-semibold">{l.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">Hosted by {l.host}</div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex gap-2">
                    <span className="inline-flex items-center gap-1"><Users className="size-3" /> {l.joined}/{l.capacity || "∞"}</span>
                    <span className="inline-flex items-center gap-1"><Eye className="size-3" /> spectators</span>
                  </div>
                  <Chip tone="neutral">{l.language}</Chip>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <div className="text-xs text-muted-foreground">{l.challenge}</div>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-[#C62828]"
                  onClick={() => handleJoin(l)}
                  disabled={full || joiningId === l.id}
                >
                  {full ? "Full" : joiningId === l.id ? "Joining" : "Join"} <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
        {!loading && cards.length === 0 && (
          <Card className="col-span-full p-6 text-center text-sm text-muted-foreground">
            No open lobbies yet. Try hosting one.
          </Card>
        )}
      </div>
      <CreateLobbyModal
        isOpen={showCreate}
        isCreating={creating}
        onClose={() => !creating && setShowCreate(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
