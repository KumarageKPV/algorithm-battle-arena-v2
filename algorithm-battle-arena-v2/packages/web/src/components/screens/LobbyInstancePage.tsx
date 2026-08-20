import { useEffect, useState } from "react";
import { Card, Chip } from "../primitives/Bits";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Check, Copy, MessageSquare, Send, Shield, Swords, Crown, Flame } from "lucide-react";

const PARTICIPANTS = [
  { n: "Aurelia Vance", h: "aurelia.v", t: "Diamond III", ready: true, host: true },
  { n: "Kenji Park", h: "kenj1", t: "Diamond I", ready: true, host: false },
  { n: "Mira Okafor", h: "mira.ok", t: "Platinum III", ready: false, host: false },
  { n: "Leon Hartwell", h: "leon.h", t: "Diamond III", ready: false, host: false },
];

const SEED = [
  { n: "Theo M.", m: "Lock in or lose your seat 😤", t: "spectator" },
  { n: "aurelia.v", m: "Ready when you are.", t: "host" },
  { n: "mira.ok", m: "1 sec, fixing my linter", t: "you" },
  { n: "kenj1", m: "gl hf", t: "" },
];

export function LobbyInstancePage({ onStart }: { onStart: () => void }) {
  const [count, setCount] = useState(28);
  useEffect(() => {
    const i = setInterval(() => setCount(c => (c > 0 ? c - 1 : c)), 1000);
    return () => clearInterval(i);
  }, []);
  const pulse = count <= 10;
  return (
    <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card glow className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8EF] via-[#FFFEFB] to-[#F4E8D6]/50" />
          <div className="absolute inset-x-0 top-0 h-1 overflow-hidden">
            <div className={`h-full ${pulse ? "bg-[var(--tension)]" : "bg-primary"}`} style={{ width: `${(count / 30) * 100}%`, transition: "width 1s linear" }} />
          </div>
          <div className="relative grid items-center gap-6 p-6 md:grid-cols-[1fr_auto_1fr]">
            <div className="text-center md:text-right">
              <div className="font-mono text-[10px] tracking-[0.2em] text-primary">HOST</div>
              <div className="font-display text-xl font-semibold">aurelia.v</div>
              <div className="text-xs text-muted-foreground">Diamond III · 2418 SR</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">STARTS IN</div>
              <div className={`font-display text-[58px] font-bold leading-none tabular-nums ${pulse ? "text-[var(--tension)] animate-pulse" : "text-foreground"}`}>
                0:{count.toString().padStart(2, "0")}
              </div>
              <div className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">2 OF 4 READY</div>
            </div>
            <div className="text-center md:text-left">
              <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--tension)]">CHALLENGERS</div>
              <div className="font-display text-xl font-semibold">3 contenders</div>
              <div className="text-xs text-muted-foreground">Avg SR · 2336</div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <Card className="p-5">
            <div className="flex items-center gap-2"><Swords className="size-4 text-primary" /><h3 className="font-display font-semibold">Articulation Run</h3><Chip tone="danger">Hard</Chip></div>
            <p className="mt-2 text-sm text-muted-foreground">Find every bridge in an undirected graph in O(V+E). First to clear all hidden tests wins; ties broken by submission time.</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Stat l="TIME" v="25:00" /><Stat l="LANG" v="C++ / Py" /><Stat l="XP" v="+240" />
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2"><Shield className="size-4 text-success" /><h3 className="font-display font-semibold">House rules</h3></div>
            <ul className="mt-2 space-y-1.5 text-sm">
              {["No external AI assistants", "Submissions sandboxed · 256MB", "Forfeit possible after 10:00", "Spectator chat is read-only"].map(r => (
                <li key={r} className="flex items-center gap-2 text-foreground/80"><Check className="size-3.5 text-success" /> {r}</li>
              ))}
            </ul>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground">PARTICIPANTS · 4</div>
            <button className="flex items-center gap-1 text-xs text-primary"><Copy className="size-3" /> Copy invite link</button>
          </div>
          <div className="divide-y divide-border">
            {PARTICIPANTS.map(p => (
              <div key={p.h} className="flex items-center gap-3 px-4 py-3">
                <Avatar className="size-9 ring-2 ring-primary/15"><AvatarFallback className="bg-primary/10 text-primary text-[11px]">{p.n.split(" ").map(s => s[0]).join("")}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-sm font-medium">{p.n} {p.host && <Crown className="size-3.5 text-[#F6C445]" />}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">@{p.h} · {p.t}</div>
                </div>
                {p.ready ? <Chip tone="success"><Check className="size-3" /> Ready</Chip> : <Chip tone="warning"><Flame className="size-3" /> Pending</Chip>}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3">
            <Button variant="outline" className="bg-white">Leave</Button>
            <Button onClick={onStart} className="gap-2 bg-primary hover:bg-[#C62828]">Force start · Host <Swords className="size-4" /></Button>
          </div>
        </Card>
      </div>

      {/* Chat */}
      <aside className="flex h-[640px] flex-col overflow-hidden rounded-xl border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2 font-display font-semibold"><MessageSquare className="size-4 text-primary" /> Lobby chat</div>
          <Chip tone="success"><span className="size-1.5 rounded-full bg-success animate-pulse" /> 6 in room</Chip>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {SEED.map((c, i) => {
            const isYou = c.t === "you";
            return (
              <div key={i} className={`flex gap-2 ${isYou ? "flex-row-reverse" : ""}`}>
                <Avatar className="size-7"><AvatarFallback className={`text-[10px] ${isYou ? "bg-primary text-white" : "bg-muted text-foreground/70"}`}>{c.n.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <div className={`max-w-[78%] ${isYou ? "text-right" : ""}`}>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">{c.n}{c.t === "host" && <Crown className="size-2.5 text-[#F6C445]" />}</div>
                  <div className={`mt-0.5 rounded-2xl px-3 py-1.5 text-sm ${isYou ? "bg-primary text-white" : "bg-muted text-foreground"}`}>{c.m}</div>
                </div>
              </div>
            );
          })}
          <div className="mx-auto w-fit rounded-full bg-[#00AEEF]/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[#00AEEF]">— SPECTATORS JOINED · 12 —</div>
        </div>
        <div className="border-t border-border p-3">
          <div className="flex gap-2">
            <Input placeholder="Say something…" className="h-9 bg-[var(--input-background)]" />
            <Button className="h-9 bg-primary hover:bg-[#C62828]"><Send className="size-4" /></Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return <div className="rounded-lg bg-muted/60 p-2 text-center"><div className="font-mono text-[9px] tracking-widest text-muted-foreground">{l}</div><div className="font-display text-sm font-semibold">{v}</div></div>;
}
