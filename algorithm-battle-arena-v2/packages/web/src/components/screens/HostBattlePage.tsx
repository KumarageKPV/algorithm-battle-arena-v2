import { useState } from "react";
import { Card, Chip, Section } from "../primitives/Bits";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Swords, User, Users, Users2, Eye, Clock, Lock, Globe, Sparkles, Rocket, ShieldCheck } from "lucide-react";

const MODES = [
  { id: "solo", t: "Solo", d: "Personal record run", i: User },
  { id: "1v1", t: "1v1 Duel", d: "Head-to-head, best of 3", i: Swords },
  { id: "team", t: "Team 3v3", d: "Coordinated squad battle", i: Users2 },
];

export function HostBattlePage({ onLaunch }: { onLaunch: () => void }) {
  const [mode, setMode] = useState("1v1");
  const [spectator, setSpectator] = useState(true);
  return (
    <div className="grid gap-6 p-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">HOST · NEW BATTLE</div>
          <h1 className="font-display text-[26px] font-semibold">Set the stage</h1>
          <p className="text-sm text-muted-foreground">Configure the match, then drop the gate.</p>
        </div>

        <Section kicker="STEP 1" title="Choose your mode">
          <div className="grid gap-3 md:grid-cols-3">
            {MODES.map(m => {
              const active = mode === m.id;
              return (
                <button key={m.id} onClick={() => setMode(m.id)} className={`group relative overflow-hidden rounded-xl border p-5 text-left transition ${active ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20" : "border-border bg-white hover:border-primary/40"}`}>
                  <div className={`grid size-10 place-items-center rounded-lg ${active ? "bg-primary text-white" : "bg-muted text-foreground/70"}`}>
                    <m.i className="size-5" />
                  </div>
                  <div className="mt-3 font-display text-base font-semibold">{m.t}</div>
                  <div className="text-xs text-muted-foreground">{m.d}</div>
                  {active && <Sparkles className="absolute right-3 top-3 size-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </Section>

        <Section kicker="STEP 2" title="Rules & rewards">
          <Card className="p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Battle name"><Input defaultValue="Sunset Duel · Graph Bridges" className="bg-[var(--input-background)]" /></Field>
              <Field label="Challenge"><Input defaultValue="Articulation Run · Hard" className="bg-[var(--input-background)]" /></Field>
              <Field label="Time limit"><div className="relative"><Input defaultValue="25" className="bg-[var(--input-background)] pr-14" /><span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">minutes</span></div></Field>
              <Field label="Primary language">
                <div className="flex flex-wrap gap-1.5">{["Python", "C++", "JS/TS", "Go", "Any"].map((l, i) => <Chip key={l} tone={i === 1 ? "primary" : "neutral"}>{l}</Chip>)}</div>
              </Field>
              <Field label="Visibility">
                <div className="grid grid-cols-3 gap-1.5">
                  <button className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-primary bg-primary/8 text-xs text-primary"><Globe className="size-3.5" /> Public</button>
                  <button className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-white text-xs text-foreground/70"><Lock className="size-3.5" /> Invite</button>
                  <button className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-white text-xs text-foreground/70"><Users className="size-3.5" /> Class only</button>
                </div>
              </Field>
              <Field label="Spectators">
                <button onClick={() => setSpectator(!spectator)} className={`flex h-9 w-full items-center justify-between rounded-md border px-3 text-xs ${spectator ? "border-primary bg-primary/8 text-primary" : "border-border bg-white text-foreground/70"}`}>
                  <span className="flex items-center gap-1.5"><Eye className="size-3.5" /> Allow spectators</span>
                  <span className={`relative h-5 w-9 rounded-full transition ${spectator ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition ${spectator ? "left-[18px]" : "left-0.5"}`} />
                  </span>
                </button>
              </Field>
            </div>

            <div className="mt-5 rounded-lg bg-[var(--surface)] p-3 text-xs text-muted-foreground">
              <ShieldCheck className="-mt-0.5 mr-1.5 inline size-3.5 text-success" />
              Fair-play: identical hidden tests, sandboxed runtimes, no AI assistants during ranked matches.
            </div>
          </Card>
        </Section>
      </div>

      <aside className="space-y-4">
        <Card glow className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8EF] via-[#FFFEFB] to-[#F4E8D6]/50" />
          <div className="relative p-6 text-center">
            <div className="font-mono text-[10px] tracking-[0.3em] text-primary">READY UP</div>
            <div className="mt-2 font-display text-3xl font-bold leading-none">SUNSET<br />DUEL</div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 font-mono text-[10px] tracking-widest text-muted-foreground">
              <Clock className="size-3" /> 25:00 · HARD · BO3
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <Stat l="Players" v="1v1" /><Stat l="Stake" v="±34 SR" /><Stat l="XP" v="+240" />
            </div>
            <Button onClick={onLaunch} size="lg" className="mt-6 h-14 w-full gap-2 bg-gradient-to-r from-primary via-[#C62828] to-[#F26A21] text-base shadow-[0_18px_45px_-15px_rgba(229,57,53,0.55)] hover:opacity-95">
              <Rocket className="size-5" /> LAUNCH BATTLE
            </Button>
            <div className="mt-3 font-mono text-[10px] tracking-widest text-muted-foreground">PRESS ENTER TO CONFIRM</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="font-mono text-[10px] tracking-widest text-muted-foreground">INVITED</div>
          <div className="mt-2 flex -space-x-2">
            {["AV", "KP", "MO", "LH"].map((n, i) => <div key={i} className="grid size-8 place-items-center rounded-full border-2 border-white bg-primary/10 font-mono text-[10px] text-primary">{n}</div>)}
            <button className="grid size-8 place-items-center rounded-full border-2 border-dashed border-border bg-white font-mono text-[10px] text-muted-foreground">+</button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Invite up to 5 players — they&apos;ll get a notification + link.</div>
        </Card>
      </aside>
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return <div className="rounded-lg border border-border bg-white/80 p-2"><div className="font-mono text-[9px] tracking-widest text-muted-foreground">{l.toUpperCase()}</div><div className="font-display text-sm font-semibold">{v}</div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
