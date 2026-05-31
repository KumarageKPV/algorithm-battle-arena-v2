import { Card, Chip, ProgressRing, Section, StatTile, XPBar } from "../primitives/Bits";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Calendar, Play, Swords, Zap, Crown, Target } from "lucide-react";
import { statisticsApi, friendsApi, studentsApi, teachersApi } from "../../lib/api";
import { useEffect, useMemo, useState } from "react";
import CreateLobbyModal from "../CreateLobbyModal";

const BADGES = [
  { t: "Graph Tamer", c: "from-[#D0E6F4] to-[#EAF4FC]", i: "🛡" },
  { t: "Streak ×10", c: "from-[#FFF3C4] to-[#FFFBE8]", i: "🔥" },
  { t: "First Blood", c: "from-[#FFD6D6] to-[#FFF0F0]", i: "⚔" },
  { t: "DP Master", c: "from-[#C8F0DC] to-[#E8F8F0]", i: "🧠" },
  { t: "Speed Demon", c: "from-[#C8EEFF] to-[#E8F7FF]", i: "⚡" },
];

const RECENT = [
  { t: "Two-Pointer Drift", r: "Win", op: "kenj1", d: "Easy", xp: "+120", time: "12m" },
  { t: "Knapsack Rerolled", r: "Win", op: "leon.h", d: "Medium", xp: "+180", time: "1h" },
  { t: "Articulation Run", r: "Loss", op: "theo.m", d: "Hard", xp: "+40", time: "3h" },
  { t: "Interval Cull", r: "Win", op: "Daily", d: "Easy", xp: "+90", time: "yest" },
];

type UserStats = {
  fullName?: string;
  rank?: number;
  matchesPlayed?: number;
  winRate?: number;
  totalScore?: number;
};

type LeaderRow = {
  participantEmail?: string;
  fullName?: string;
  totalScore?: number;
  matchesPlayed?: number;
  winRate?: number;
};

type Friend = {
  studentId: number;
  fullName?: string;
  email?: string;
  isOnline?: boolean;
  friendsSince?: string;
};

type Teacher = {
  teacherId: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
};

export function StudentDashboard({ onNav, onCreateLobby }: {
  onNav: (v: any) => void;
  onCreateLobby: (data: { name: string; maxPlayers: number; mode: string; difficulty: string }) => Promise<void>;
}) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [friendSearchResults, setFriendSearchResults] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [acceptedTeachers, setAcceptedTeachers] = useState<Teacher[]>([]);
  const [teacherDirectory, setTeacherDirectory] = useState<Teacher[]>([]);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [pendingTeacherIds, setPendingTeacherIds] = useState<Set<number>>(new Set());
  const [showCreateLobby, setShowCreateLobby] = useState(false);
  const [creatingLobby, setCreatingLobby] = useState(false);

  const refreshFriends = async () => {
    const [friendsRes, receivedRes, sentRes] = await Promise.allSettled([
      friendsApi.getFriends(),
      friendsApi.getReceived(),
      friendsApi.getSent(),
    ]);
    if (friendsRes.status === "fulfilled") {
      setFriends(Array.isArray(friendsRes.value.data) ? friendsRes.value.data : []);
    }
    if (receivedRes.status === "fulfilled") {
      setReceivedRequests(Array.isArray(receivedRes.value.data) ? receivedRes.value.data : []);
    }
    if (sentRes.status === "fulfilled") {
      setSentRequests(Array.isArray(sentRes.value.data) ? sentRes.value.data : []);
    }
  };

  const refreshTeachers = async () => {
    const [acceptedRes, directoryRes] = await Promise.allSettled([
      studentsApi.getTeachers(),
      teachersApi.getAll(),
    ]);
    if (acceptedRes.status === "fulfilled") {
      setAcceptedTeachers(Array.isArray(acceptedRes.value.data) ? acceptedRes.value.data : []);
    }
    if (directoryRes.status === "fulfilled") {
      setTeacherDirectory(Array.isArray(directoryRes.value.data) ? directoryRes.value.data : []);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [statsRes, leaderboardRes] = await Promise.all([
          statisticsApi.getUserStats(),
          statisticsApi.getLeaderboard(),
        ]);
        if (!active) return;
        setUserStats(statsRes.data || null);
        setLeaders(Array.isArray(leaderboardRes.data) ? leaderboardRes.data : []);
      } catch {
        if (!active) return;
        setLeaders([]);
      }

      if (!active) return;
      await Promise.all([refreshFriends(), refreshTeachers()]);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const acceptedTeacherIds = useMemo(() => new Set(acceptedTeachers.map((t) => t.teacherId)), [acceptedTeachers]);

  const handleFriendSearch = async () => {
    const q = friendSearch.trim();
    if (!q) {
      setFriendSearchResults([]);
      return;
    }
    try {
      const res = await friendsApi.search(q);
      setFriendSearchResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      setFriendSearchResults([]);
    }
  };

  const handleSendRequest = async (studentId: number) => {
    try {
      await friendsApi.sendRequest(studentId);
      await refreshFriends();
    } catch {
      // noop
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await friendsApi.accept(requestId);
      await refreshFriends();
    } catch {
      // noop
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await friendsApi.reject(requestId);
      await refreshFriends();
    } catch {
      // noop
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    try {
      await friendsApi.remove(friendId);
      await refreshFriends();
    } catch {
      // noop
    }
  };

  const handleRequestTeacher = async (teacherId: number) => {
    try {
      await studentsApi.requestTeacher(teacherId);
      setPendingTeacherIds((prev) => new Set(prev).add(teacherId));
    } catch {
      // noop
    }
  };

  const filteredTeachers = useMemo(() => {
    const q = teacherSearch.trim().toLowerCase();
    const pool = teacherDirectory.filter((t) => !acceptedTeacherIds.has(t.teacherId));
    if (!q) return pool;
    return pool.filter((t) =>
      `${t.firstName || ""} ${t.lastName || ""} ${t.fullName || ""} ${t.email || ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [teacherDirectory, teacherSearch, acceptedTeacherIds]);

  const rivals = useMemo(() => leaders.slice(0, 4).map((row, index) => ({
    id: row.participantEmail || `${index}`,
    name: row.fullName || row.participantEmail || "Unknown",
    tier: row.winRate !== undefined ? `${Math.round(row.winRate)}% WR` : "Unranked",
    streak: 0,
    rating: row.totalScore ?? 0,
  })), [leaders]);

  const handleCreateLobby = async (data: { name: string; maxPlayers: number; mode: string; difficulty: string }) => {
    setCreatingLobby(true);
    try {
      await onCreateLobby(data);
      setShowCreateLobby(false);
    } finally {
      setCreatingLobby(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-5 py-6 sm:px-6 lg:px-8">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#FFF8EF] via-[#FFFEFB] to-[#F4E8D6]/50 p-6">
        <div className="absolute -right-12 -top-12 size-60 rounded-full bg-[#E53935]/8 blur-2xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <ProgressRing value={72} size={84} stroke={9} label="SEASON" />
          <div className="flex-1 min-w-[240px]">
            <div className="font-mono text-[10px] tracking-[0.2em] text-primary">DIAMOND III · 2418 SR</div>
            <h1 className="mt-1 font-display text-[26px] font-semibold leading-tight">Welcome back, {userStats?.fullName || "Arena coder"}.</h1>
            <p className="mt-1 text-sm text-muted-foreground">12-win streak. Two more battles to <b className="text-foreground">Diamond II</b>.</p>
            <div className="mt-3 max-w-md"><XPBar value={1320} max={1800} label="SR PROGRESS" /></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowCreateLobby(true)} className="h-11 gap-2 bg-primary px-5 hover:bg-[#C62828]"><Play className="size-4 fill-white" /> Quick match</Button>
            <Button onClick={() => onNav("host")} variant="outline" className="h-11 gap-2 bg-white px-5"><Swords className="size-4 text-primary" /> Host a battle</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="GLOBAL RANK" value={userStats?.rank ? `#${userStats.rank}` : "—"} sub="Season standings" accent="primary" />
        <StatTile label="WIN RATE" value={`${Math.round(userStats?.winRate ?? 0)}%`} sub={`${userStats?.matchesPlayed ?? 0} matches`} accent="success" />
        <StatTile label="STREAK" value="—" sub="Syncing" accent="tension" />
        <StatTile label="AVG. SUBMIT" value="—" sub="Awaiting data" accent="warning" />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
        <div className="min-w-0 space-y-6">
          <Section title="Recent matches" kicker="LAST 7 DAYS" action={<a className="text-xs text-primary">View history →</a>}>
            <Card>
              <div className="divide-y divide-border">
                {RECENT.map((m, i) => (
                  <div key={i} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-4 py-3">
                    <span className={`grid size-9 place-items-center rounded-lg font-mono text-[11px] font-semibold ${m.r === "Win" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{m.r === "Win" ? "W" : "L"}</span>
                    <div>
                      <div className="text-sm font-medium">{m.t}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">vs {m.op} · {m.time} ago</div>
                    </div>
                    <Chip tone={m.d === "Easy" ? "success" : m.d === "Medium" ? "warning" : "danger"}>{m.d}</Chip>
                    <div className={`font-display text-sm font-semibold tabular-nums ${m.r === "Win" ? "text-success" : "text-muted-foreground"}`}>{m.xp}</div>
                  </div>
                ))}
              </div>
            </Card>
          </Section>

          <Section title="Upcoming battles" kicker="ON YOUR SCHEDULE" action={<a className="text-xs text-primary">All events →</a>}>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { t: "Class Tournament · CS204-A", d: "Tomorrow · 14:00", host: "Prof. Lin Kao", chip: "primary" as const, c: "Cup" },
                { t: "Recursion Rumble", d: "Fri · 19:30", host: "Open · 24 joined", chip: "tension" as const, c: "Team" },
              ].map((e, i) => (
                <Card key={i} className="flex h-full flex-col overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-border bg-gradient-to-br from-[#FFF8EF]/70 to-transparent p-4">
                    <div className="grid size-10 place-items-center rounded-lg bg-white shadow-sm"><Calendar className="size-4 text-primary" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-sm font-semibold">{e.t}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{e.host}</div>
                    </div>
                    <Chip tone={e.chip}>{e.c}</Chip>
                  </div>
                  <div className="mt-auto flex items-center justify-between p-3">
                    <span className="text-xs text-muted-foreground">{e.d}</span>
                    <Button size="sm" variant="outline">Set reminder</Button>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        </div>

        <div className="min-w-0 space-y-6">
          <Section title="Badges" kicker="EARNED · 24 OF 60">
            <Card className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {BADGES.map((b) => (
                  <div key={b.t} className={`group relative aspect-square rounded-xl border border-border bg-gradient-to-br ${b.c} p-2 text-center`}>
                    <div className="grid h-full place-items-center text-2xl">{b.i}</div>
                    <div className="absolute inset-x-1 bottom-1 truncate font-mono text-[8px] tracking-wider text-foreground/70">{b.t}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Next: <b className="text-foreground">Heap Hero</b></span>
                <a className="text-primary">All badges →</a>
              </div>
            </Card>
          </Section>

          <Section title="Teachers" kicker="MENTORS">
            <Card className="space-y-3 p-4">
              <div>
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground">ACCEPTED TEACHERS</div>
                {acceptedTeachers.length ? (
                  <div className="mt-2 space-y-2">
                    {acceptedTeachers.map((t) => (
                      <div key={t.teacherId} className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
                        <Avatar className="size-7"><AvatarFallback className="bg-primary/10 text-primary text-[10px]">{(t.firstName || t.fullName || "T").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{t.fullName || `${t.firstName || ""} ${t.lastName || ""}`.trim() || t.email}</div>
                          <div className="font-mono text-[10px] text-muted-foreground truncate">{t.email}</div>
                        </div>
                        <Chip tone="success">Active</Chip>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-muted-foreground">No accepted teachers yet.</div>
                )}
              </div>

              <div className="border-t border-border pt-3">
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground">REQUEST A TEACHER</div>
                <div className="mt-2 flex gap-2">
                  <Input value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} placeholder="Search teachers" className="h-9 bg-[var(--input-background)]" />
                  <Button size="sm" variant="outline" className="bg-white" onClick={() => setTeacherSearch(teacherSearch.trim())}>Filter</Button>
                </div>
                <div className="mt-3 space-y-2">
                  {filteredTeachers.length ? filteredTeachers.slice(0, 5).map((t) => (
                    <div key={t.teacherId} className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
                      <Avatar className="size-7"><AvatarFallback className="bg-primary/10 text-primary text-[10px]">{(t.firstName || t.fullName || "T").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{t.fullName || `${t.firstName || ""} ${t.lastName || ""}`.trim() || t.email}</div>
                        <div className="font-mono text-[10px] text-muted-foreground truncate">{t.email}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        disabled={pendingTeacherIds.has(t.teacherId)}
                        onClick={() => handleRequestTeacher(t.teacherId)}
                      >
                        {pendingTeacherIds.has(t.teacherId) ? "Requested" : "Request"}
                      </Button>
                    </div>
                  )) : (
                    <div className="text-xs text-muted-foreground">No teachers found.</div>
                  )}
                </div>
              </div>
            </Card>
          </Section>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <Section title="Friends" kicker="SOCIAL">
            <Card className="space-y-3 p-4">
              <div>
                <div className="flex gap-2">
                  <Input value={friendSearch} onChange={(e) => setFriendSearch(e.target.value)} placeholder="Find friends" className="h-9 bg-[var(--input-background)]" />
                  <Button size="sm" variant="outline" className="bg-white" onClick={handleFriendSearch}>Search</Button>
                </div>
                {friendSearchResults.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {friendSearchResults.slice(0, 5).map((s: any) => (
                      <div key={s.studentId} className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
                        <Avatar className="size-7"><AvatarFallback className="bg-primary/10 text-primary text-[10px]">{`${s.firstName || ""}${s.lastName || ""}`.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{`${s.firstName || ""} ${s.lastName || ""}`.trim() || s.email}</div>
                          <div className="font-mono text-[10px] text-muted-foreground truncate">{s.email}</div>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleSendRequest(s.studentId)}>
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-3">
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground">PENDING REQUESTS</div>
                <div className="mt-2 space-y-2">
                  {receivedRequests.length ? receivedRequests.slice(0, 4).map((r: any) => (
                    <div key={r.requestId} className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
                      <Avatar className="size-7"><AvatarFallback className="bg-primary/10 text-primary text-[10px]">{`${r.sender?.firstName || ""}${r.sender?.lastName || ""}`.slice(0, 2).toUpperCase() || "FR"}</AvatarFallback></Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{`${r.sender?.firstName || ""} ${r.sender?.lastName || ""}`.trim() || r.sender?.email || "Request"}</div>
                        <div className="font-mono text-[10px] text-muted-foreground truncate">{r.sender?.email}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" className="h-7 px-2 text-xs" onClick={() => handleAcceptRequest(r.requestId)}>Accept</Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleRejectRequest(r.requestId)}>Reject</Button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-xs text-muted-foreground">No pending requests.</div>
                  )}
                </div>
                {sentRequests.length > 0 && (
                  <div className="mt-2 text-[11px] text-muted-foreground">Sent {sentRequests.length} request{sentRequests.length === 1 ? "" : "s"}.</div>
                )}
              </div>

              <div className="border-t border-border pt-3">
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground">YOUR FRIENDS</div>
                <div className="mt-2 space-y-2">
                  {friends.length ? friends.slice(0, 5).map((f) => (
                    <div key={f.studentId} className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
                      <Avatar className="size-7"><AvatarFallback className="bg-primary/10 text-primary text-[10px]">{(f.fullName || f.email || "F").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{f.fullName || f.email}</div>
                        <div className="font-mono text-[10px] text-muted-foreground truncate">{f.email}</div>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleRemoveFriend(f.studentId)}>
                        Remove
                      </Button>
                    </div>
                  )) : (
                    <div className="text-xs text-muted-foreground">No friends yet.</div>
                  )}
                </div>
              </div>
            </Card>
          </Section>

          <Section title="Nearest rivals" kicker="IN STRIKING DISTANCE">
            <Card>
              <div className="divide-y divide-border">
                {rivals.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-5 text-center font-mono text-[11px] tabular-nums text-muted-foreground">{i === 1 ? "▲" : "·"}</div>
                    <Avatar className="size-8"><AvatarFallback className="bg-primary/10 text-primary text-[11px]">{p.name.split(" ").map(s => s[0]).join("")}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{p.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{p.tier}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-sm font-semibold tabular-nums">{p.rating}</div>
                      <div className="font-mono text-[10px] text-[var(--tension)]">+{Math.abs((userStats?.totalScore ?? 0) - p.rating)}</div>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Challenge</Button>
                  </div>
                ))}
              </div>
            </Card>
          </Section>

          <Section kicker="DAILY OBJECTIVES" title="Quests">
            <Card className="space-y-3 p-4">
              {[
                { i: Target, t: "Win 1 ranked match", p: 100, x: "+50 XP" },
                { i: Zap, t: "Submit under 200ms", p: 60, x: "+30 XP" },
                { i: Crown, t: "Beat a Diamond+", p: 0, x: "+120 XP" },
              ].map((q, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-lg bg-primary/8"><q.i className="size-4 text-primary" /></div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm"><span className="font-medium">{q.t}</span><span className="font-mono text-[10px] text-muted-foreground">{q.x}</span></div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${q.p}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </Section>
      </div>
      <CreateLobbyModal
        isOpen={showCreateLobby}
        isCreating={creatingLobby}
        onClose={() => !creatingLobby && setShowCreateLobby(false)}
        onCreate={handleCreateLobby}
      />
    </div>
  );
}
