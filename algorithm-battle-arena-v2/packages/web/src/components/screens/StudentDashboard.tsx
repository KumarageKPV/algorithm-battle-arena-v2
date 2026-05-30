import { Card, Chip, ProgressRing, Section, StatTile, XPBar } from "../primitives/Bits";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Calendar, Play, Swords, Zap, Crown, Target, LogOut } from "lucide-react";
import { statisticsApi } from "../../lib/api";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";

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

export function StudentDashboard({ onNav }: { onNav: (v: any) => void }) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const { logout } = useAuth();

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
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const rivals = useMemo(() => leaders.slice(0, 4).map((row, index) => ({
    id: row.participantEmail || `${index}`,
    name: row.fullName || row.participantEmail || "Unknown",
    tier: row.winRate !== undefined ? `${Math.round(row.winRate)}% WR` : "Unranked",
    streak: 0,
    rating: row.totalScore ?? 0,
  })), [leaders]);

  return (
    <div className="space-y-6 p-6">
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
            <Button onClick={() => onNav("lobby")} className="h-11 gap-2 bg-primary px-5 hover:bg-[#C62828]"><Play className="size-4 fill-white" /> Quick match</Button>
            <Button onClick={() => onNav("host")} variant="outline" className="h-11 gap-2 bg-white px-5"><Swords className="size-4 text-primary" /> Host a battle</Button>
            <Button onClick={logout} variant="outline" className="h-11 gap-2 bg-white px-4 text-destructive hover:text-destructive">
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="GLOBAL RANK" value={userStats?.rank ? `#${userStats.rank}` : "—"} sub="Season standings" accent="primary" />
        <StatTile label="WIN RATE" value={`${Math.round(userStats?.winRate ?? 0)}%`} sub={`${userStats?.matchesPlayed ?? 0} matches`} accent="success" />
        <StatTile label="STREAK" value="—" sub="Syncing" accent="tension" />
        <StatTile label="AVG. SUBMIT" value="—" sub="Awaiting data" accent="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
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
                <Card key={i} className="overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-border bg-gradient-to-br from-[#FFF8EF]/70 to-transparent p-4">
                    <div className="grid size-10 place-items-center rounded-lg bg-white shadow-sm"><Calendar className="size-4 text-primary" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-sm font-semibold">{e.t}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{e.host}</div>
                    </div>
                    <Chip tone={e.chip}>{e.c}</Chip>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <span className="text-xs text-muted-foreground">{e.d}</span>
                    <Button size="sm" variant="outline">Set reminder</Button>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-6">
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

          <Section title="Nearest rivals" kicker="IN STRIKING DISTANCE">
            <Card>
              <div className="divide-y divide-border">
                {(rivals.length ? rivals : [{ id: "fallback", name: "No rivals yet", tier: "", streak: 0, rating: 0 }]).map((p, i) => (
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
      </div>
    </div>
  );
}
