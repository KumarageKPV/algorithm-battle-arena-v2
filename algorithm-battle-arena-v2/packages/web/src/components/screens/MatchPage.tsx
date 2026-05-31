import { useEffect, useState } from "react";
import { Chip } from "../primitives/Bits";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Check, Play, X, Flame, MessageSquare, Send, Zap, Trophy, Code2, AlertTriangle } from "lucide-react";
import { TEST_CASES } from "@/lib/data";

const SUPPORTED_LANGUAGES = [
  { id: 48, name: "C (GCC 7.4.0)" },
  { id: 52, name: "C++ (GCC 7.4.0)" },
  { id: 49, name: "C (GCC 8.3.0)" },
  { id: 53, name: "C++ (GCC 8.3.0)" },
  { id: 50, name: "C (GCC 9.2.0)" },
  { id: 54, name: "C++ (GCC 9.2.0)" },
  { id: 62, name: "Java (OpenJDK 13.0.1)" },
  { id: 63, name: "JavaScript (Node.js 12.14.0)" },
  { id: 70, name: "Python (2.7.17)" },
  { id: 71, name: "Python (3.8.1)" },
];

const CODE_LINES = [
  "from collections import defaultdict",
  "",
  "def find_bridges(n, edges):",
  "    g = defaultdict(list)",
  "    for u, v in edges:",
  "        g[u].append(v); g[v].append(u)",
  "",
  "    disc, low, time = {}, {}, [0]",
  "    bridges = []",
  "",
  "    def dfs(u, parent):",
  "        disc[u] = low[u] = time[0]; time[0] += 1",
  "        for v in g[u]:",
  "            if v not in disc:",
  "                dfs(v, u)",
  "                low[u] = min(low[u], low[v])",
  "                if low[v] > disc[u]:",
  "                    bridges.append((u, v))",
  "            elif v != parent:",
  "                low[u] = min(low[u], disc[v])",
  "",
  "    for s in range(n):",
  "        if s not in disc: dfs(s, -1)",
  "    return sorted(bridges)",
];

export function MatchPage({ onEnd }: { onEnd: () => void }) {
  const [t, setT] = useState(14 * 60 + 32);
  useEffect(() => { const i = setInterval(() => setT(x => Math.max(0, x - 1)), 1000); return () => clearInterval(i); }, []);
  const mm = Math.floor(t / 60).toString().padStart(2, "0");
  const ss = (t % 60).toString().padStart(2, "0");
  const danger = t < 60;

  return (
    <div className="relative flex h-[calc(100vh-56px)] flex-col bg-[var(--surface)]">
      {/* HUD top */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-border bg-white px-5 py-2.5">
        <PlayerScore name="aurelia.v" sr={2418} tests="4/6" wpm="38" side="left" />
        <div className="text-center">
          <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">TIME REMAINING</div>
          <div className={`font-display text-[34px] font-bold leading-none tabular-nums ${danger ? "text-[var(--tension)] animate-pulse" : "text-foreground"}`}>{mm}:{ss}</div>
            <div className="mt-1 flex items-center justify-center gap-2">
              <Chip tone="tension"><Flame className="size-3" /> BO3 · Game 2</Chip>
              <Chip tone="primary">Hard · {SUPPORTED_LANGUAGES.map(l => l.name.split(' (')[0]).join(' / ')}</Chip>
            </div>
        </div>
        <PlayerScore name="kenj1" sr={2487} tests="3/6" wpm="42" side="right" />
      </div>

      {/* Main */}
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_320px]">
        {/* Editor */}
        <div className="flex min-h-0 flex-col border-r border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <div className="flex gap-1">
              {["solution.py", "tests.py"].map((f, i) => (
                <button key={f} className={`flex items-center gap-1.5 rounded-t-md px-3 py-1.5 font-mono text-[11px] ${i === 0 ? "bg-[var(--ivory)] text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <Code2 className="size-3" />{f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Chip tone="warning"><AlertTriangle className="size-3" /> Unsaved · auto in 4s</Chip>
              <Chip><Zap className="size-3 text-primary" /> Py 3.12</Chip>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-[var(--ivory)] font-mono text-[12.5px] leading-[1.7]">
            <table className="w-full">
              <tbody>
                {CODE_LINES.map((l, i) => (
                  <tr key={i} className={i === 17 ? "bg-success/10" : i === 19 ? "bg-amber-100/60" : ""}>
                    <td className="w-12 select-none px-3 text-right text-muted-foreground/70">{i + 1}</td>
                    <td className="whitespace-pre py-[1px] text-foreground/85">{l || " "}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border bg-white px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Ln 17, Col 26</span><span>·</span><span>Tabs · 4</span><span>·</span><span className="text-success">● connected</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-white"><Play className="size-3.5" /> Run sample</Button>
              <Button onClick={onEnd} className="bg-primary hover:bg-[#C62828]"><Trophy className="size-3.5" /> Submit</Button>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="flex min-h-0 flex-col bg-white">
          {/* Tests */}
          <div className="border-b border-border">
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground">TESTS · 3/6 PASSING</div>
              <Chip tone="success">▲ +1 just now</Chip>
            </div>
            <div className="max-h-72 overflow-y-auto px-2 pb-2">
              {TEST_CASES.map(tc => {
                const icon = tc.status === "pass" ? <Check className="size-3.5 text-success" /> : tc.status === "fail" ? <X className="size-3.5 text-destructive" /> : <span className="size-2 rounded-full bg-muted-foreground/40" />;
                const bg = tc.status === "pass" ? "bg-success/5 border-success/20" : tc.status === "fail" ? "bg-destructive/5 border-destructive/20" : "bg-muted/40 border-border";
                return (
                  <div key={tc.id} className={`mb-1 flex items-center gap-2.5 rounded-md border px-2.5 py-2 ${bg}`}>
                    <span className="grid size-5 place-items-center">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs font-medium">{tc.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">case #{tc.id}</div>
                    </div>
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{tc.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live feed */}
          <div className="border-b border-border p-3">
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground">LIVE FEED</div>
            <div className="mt-2 space-y-1.5 text-xs">
              <Event tone="success" t="kenj1 passed Sample · single edge" />
              <Event tone="tension" t="You — Hidden · cycles FAILED" />
              <Event tone="primary" t="Spectator count · 24 watching" />
              <Event tone="warning" t="2 minutes to first sudden-death" />
            </div>
          </div>

          {/* Quick chat */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-muted-foreground"><MessageSquare className="size-3" /> SPEC · QUICK CHAT</div>
              <span className="font-mono text-[10px] text-muted-foreground">12</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-2 text-xs">
              <Bubble n="Theo M." m="that DFS is slick 👀" />
              <Bubble n="Mira" m="watch for parallel edges" />
              <Bubble n="Leon" m="lows array looks off though" />
            </div>
            <div className="border-t border-border p-2.5">
              <div className="flex gap-1.5">
                {["GG", "Nice!", "🔥"].map(q => <button key={q} className="rounded-md border border-border bg-white px-2 py-1 text-[11px] hover:bg-muted">{q}</button>)}
                <Button size="sm" className="ml-auto h-7 bg-primary hover:bg-[#C62828]"><Send className="size-3" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-white px-4 py-2.5 shadow-[0_18px_45px_-15px_rgba(22,163,74,0.4)]">
          <Check className="size-4 text-success" />
          <div className="text-sm"><b>Test passed:</b> Edge · 1 element <span className="font-mono text-[11px] text-muted-foreground">+1 SR projected</span></div>
        </div>
      </div>
    </div>
  );
}

function PlayerScore({ name, sr, tests, wpm, side }: { name: string; sr: number; tests: string; wpm: string; side: "left" | "right" }) {
  return (
    <div className={`flex items-center gap-3 ${side === "right" ? "flex-row-reverse text-right" : ""}`}>
      <Avatar className="size-12 ring-2 ring-primary/30"><AvatarFallback className="bg-primary text-white">{name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
      <div>
        <div className="font-display text-base font-semibold leading-tight">{name}</div>
        <div className="font-mono text-[10px] text-muted-foreground">SR {sr} · {wpm} kpm</div>
        <div className={`mt-1 inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 font-mono text-[10px] ${side === "right" ? "flex-row-reverse" : ""}`}>
          <span className="text-foreground">Tests</span><span className="font-display text-foreground tabular-nums">{tests}</span>
        </div>
      </div>
    </div>
  );
}

function Event({ tone, t }: { tone: "success" | "tension" | "primary" | "warning"; t: string }) {
  const dot = { success: "bg-success", tension: "bg-[var(--tension)]", primary: "bg-primary", warning: "bg-[#F6C445]" }[tone];
  return <div className="flex items-start gap-2"><span className={`mt-1 size-1.5 shrink-0 rounded-full ${dot}`} /><span className="text-foreground/80">{t}</span></div>;
}

function Bubble({ n, m }: { n: string; m: string }) {
  return (
    <div className="flex items-start gap-2">
      <Avatar className="size-5"><AvatarFallback className="bg-muted text-[9px]">{n.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
      <div><b className="text-foreground">{n}</b> <span className="text-muted-foreground">{m}</span></div>
    </div>
  );
}
