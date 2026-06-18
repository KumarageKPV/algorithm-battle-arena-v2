import { useEffect, useMemo, useState } from "react";
import { Card, Chip } from "../primitives/Bits";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { PLAYERS, COUNTRIES } from "../../lib/data";
import { Crown, Trophy, Medal, Flame, TrendingUp, TrendingDown } from "lucide-react";
import { statisticsApi } from "../../lib/api";

const TABS = ["Global", "Class · CS204-A", "Friends", "This Season"];

export function LeaderboardPage() {
  const [tab, setTab] = useState(0);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await statisticsApi.getLeaderboard();
        if (!active) return;
        setRows(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!active) return;
        setRows([]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const leaderboard = useMemo(() => {
    if (!rows.length) return PLAYERS;
    return rows.map((row: any, index: number) => ({
      id: row.participantEmail || row.fullName || `row-${index}`,
      name: row.fullName || row.participantEmail || "Unknown",
      handle: row.participantEmail || "",
      tier: row.rank ? `Rank #${row.rank}` : "Unranked",
      xp: row.totalScore || 0,
      streak: 0,
      wins: row.matchesPlayed || 0,
      country: "US",
      rating: row.totalScore || 0,
    }));
  }, [rows]);

  const top = leaderboard.slice().sort((a, b) => b.rating - a.rating);
  const [p1, p2, p3, ...rest] = top;
  const fallback = top[0] || PLAYERS[0];
  const podium = [p2 ?? fallback, p1 ?? fallback, p3 ?? fallback];
  const me = top.find(p => p.name === "Aurelia Vance") || top[0] || fallback;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">SEASON OBSIDIAN · WEEK 6</div>
          <h1 className="font-display text-[26px] font-semibold flex items-center gap-2"><Trophy className="size-6 text-[#F6C445]" /> Leaderboard</h1>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-white p-0.5">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} className={`h-8 rounded-md px-3 text-xs ${tab === i ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Podium */}
      <Card glow className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8EF]/60 via-[#FFFEFB] to-[#F4E8D6]/60" />
        <div className="relative grid grid-cols-3 items-end gap-4 px-6 pb-2 pt-8 md:px-12">
          <Podium p={podium[0]} place={2} h={120} medal="🥈" />
          <Podium p={podium[1]} place={1} h={160} medal="🥇" champ />
          <Podium p={podium[2]} place={3} h={100} medal="🥉" />
        </div>
        <div className="relative grid grid-cols-3 divide-x divide-border border-t border-border bg-white/80">
          {podium.map((p, i) => (
            <div key={`${p.id}-${i}`} className="p-4 text-center">
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{["RUNNER UP", "CHAMPION · WK 6", "THIRD"][i]}</div>
              <div className="mt-0.5 font-display text-lg font-semibold tabular-nums">{p.rating}</div>
              <div className="text-xs text-muted-foreground">{p.wins} wins · {p.streak}W streak</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="grid grid-cols-[48px_1fr_120px_100px_80px_70px] items-center gap-3 border-b border-border bg-muted/50 px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>#</span><span>Player</span><span>Tier</span><span>SR</span><span>Trend</span><span>Streak</span>
          </div>
          <div className="divide-y divide-border">
            {top.map((p, i) => {
              const isMe = p.name === me.name;
              const delta = (p.rating % 7) - 3;
              return (
                <div key={p.id} className={`grid grid-cols-[48px_1fr_120px_100px_80px_70px] items-center gap-3 px-4 py-3 ${isMe ? "bg-primary/[0.04] ring-1 ring-inset ring-primary/30" : "hover:bg-muted/30"}`}>
                  <div className="flex items-center gap-1 font-mono text-xs tabular-nums">
                    {i < 3 ? <Medal className={`size-3.5 ${i === 0 ? "text-[#F6C445]" : i === 1 ? "text-zinc-400" : "text-[#F26A21]"}`} /> : <span className="w-3.5" />}
                    #{i + 1}
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-8 ring-1 ring-primary/15"><AvatarFallback className="bg-primary/10 text-primary text-[11px]">{p.name.split(" ").map((s: string) => s[0]).join("")}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-medium">{p.name} {isMe && <Chip tone="primary">You</Chip>}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">@{p.handle} {COUNTRIES[p.country]}</div>
                    </div>
                  </div>
                  <Chip tone={p.tier.startsWith("Master") ? "tension" : p.tier.startsWith("Diamond") ? "primary" : "neutral"}>{p.tier}</Chip>
                  <div className="font-display font-semibold tabular-nums">{p.rating}</div>
                  <div className={`flex items-center gap-1 font-mono text-xs ${delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                    {delta > 0 ? <TrendingUp className="size-3" /> : delta < 0 ? <TrendingDown className="size-3" /> : <span>·</span>}
                    {delta > 0 ? `+${delta * 8}` : delta < 0 ? delta * 8 : "—"}
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs tabular-nums">
                    <Flame className={`size-3 ${p.streak >= 10 ? "text-[var(--tension)]" : "text-muted-foreground"}`} />{p.streak}W
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-primary/10 to-[#F4E8D6]/60 p-5">
              <div className="font-mono text-[10px] tracking-widest text-primary">YOUR STANDING</div>
              <div className="mt-1 font-display text-2xl font-semibold">#1,284 globally</div>
              <div className="text-xs text-muted-foreground">Top 4% · climbing 312 places this week</div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary to-[#F26A21]" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 font-display font-semibold"><Crown className="size-4 text-[#F6C445]" /> Nearby rivals</div>
            <div className="mt-3 space-y-2">
              {rest.slice(0, 3).map(r => (
                <div key={r.id} className="flex items-center gap-2.5 rounded-lg border border-border bg-white px-3 py-2">
                  <Avatar className="size-7"><AvatarFallback className="bg-primary/10 text-primary text-[10px]">{r.name.split(" ").map((s: string) => s[0]).join("")}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">±{Math.abs(me.rating - r.rating)} SR away</div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Challenge</Button>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-[#F6C445]/12 px-3 py-2 text-[11px] text-[#7A5A00]">
              <Flame className="-mt-0.5 mr-1 inline size-3" /> Catching @theo.m before Sunday gives you Master qualifier points.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Podium({ p, place, h, medal, champ }: { p: any; place: number; h: number; medal: string; champ?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-2xl">{medal}</div>
      <Avatar className={`mt-1 size-16 ring-4 ${champ ? "ring-[#F6C445]/60" : "ring-primary/20"}`}>
        <AvatarFallback className="bg-primary text-white">{p.name.split(" ").map((s: string) => s[0]).join("")}</AvatarFallback>
      </Avatar>
      <div className="mt-2 font-display text-sm font-semibold">{p.name}</div>
      <div className="font-mono text-[10px] text-muted-foreground">{p.tier}</div>
      <div className={`mt-3 w-full rounded-t-xl border border-b-0 ${champ ? "border-[#F6C445]/50 bg-gradient-to-b from-[#FFF3C4] to-[#FFE484]" : "border-border bg-white"}`} style={{ height: h }}>
        <div className="pt-3 font-display text-3xl font-bold">{place}</div>
        <div className="font-mono text-[10px] text-muted-foreground">{p.rating} SR</div>
      </div>
    </div>
  );
}
