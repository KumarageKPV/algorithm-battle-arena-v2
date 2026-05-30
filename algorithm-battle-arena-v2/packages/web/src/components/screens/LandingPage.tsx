import { Logo } from "../brand/Logo";
import { Card, Chip, GridArt } from "../primitives/Bits";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ArrowRight, Play, Sparkles, Swords, Trophy, MessageSquare, Flame, ShieldCheck } from "lucide-react";
import { PLAYERS } from "../../lib/data";

export function LandingPage({ onAuth, onApp, onHost }: { onAuth: (v: "login" | "register") => void; onApp: () => void; onHost: () => void }) {
  return (
    <div className="min-h-screen bg-[#FFF8EF] text-foreground">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a className="hover:text-foreground">Arenas</a>
          <a className="hover:text-foreground">Seasons</a>
          <a className="hover:text-foreground">For Educators</a>
          <a className="hover:text-foreground">Pricing</a>
          <a className="hover:text-foreground">Changelog</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => onAuth("login")}>Sign in</Button>
          <Button onClick={() => onAuth("register")} className="bg-primary hover:bg-[#C62828]">Get started <ArrowRight className="size-4" /></Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <GridArt />
        <div className="relative mx-auto max-w-7xl px-6 pt-12 pb-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Chip tone="primary"><Sparkles className="size-3" /> Season Obsidian · Now Live</Chip>
              <h1 className="mt-4 font-display text-[64px] font-bold leading-[1.02] tracking-[-0.02em]">
                Code.<br />Compete.<br />
                <span className="bg-gradient-to-r from-[#E53935] via-[#F26A21] to-[#F6C445] bg-clip-text text-transparent">Conquer.</span>
              </h1>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                A ranked battle arena for coders. Climb tiers, host live duels, and turn your classroom into a competitive league — without the dark-mode tropes.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={onApp} className="h-12 gap-2 bg-primary px-5 hover:bg-[#C62828]">
                  <Play className="size-4 fill-white" /> Launch arena
                </Button>
                <Button size="lg" variant="outline" onClick={onHost} className="h-12 gap-2 border-border bg-white px-5">
                  Host a battle <Swords className="size-4 text-primary" />
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-success" /> SOC 2 · FERPA aware</div>
                <div className="flex items-center gap-2"><Flame className="size-4 text-[var(--tension)]" /> 42,108 players online</div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              <Card glow className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-[#FFF8EF] to-[#F4E8D6]/60 px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-red-400/70" /><span className="size-2.5 rounded-full bg-amber-400/70" /><span className="size-2.5 rounded-full bg-green-400/70" />
                  </div>
                  <Chip tone="tension"><Flame className="size-3" /> Live · 1v1 · 04:12</Chip>
                  <div className="font-mono text-[10px] tracking-widest text-muted-foreground">MATCH #A29F-22</div>
                </div>
                <div className="grid grid-cols-2 gap-px bg-border">
                  <div className="bg-white p-4">
                    <PlayerLine name="aurelia.v" rating={2418} side="left" score={3} />
                    <pre className="mt-3 overflow-hidden rounded-lg bg-[#FAF0E3] p-3 font-mono text-[11px] leading-5 text-foreground/85">
{`def shortest(graph, s, t):
  pq = [(0, s)]
  dist = {s: 0}
  while pq:
    d,u = heappop(pq)
    if u == t: return d`}
                    </pre>
                    <div className="mt-2 flex gap-1.5">
                      <Chip tone="success">▲ 3/6 tests</Chip><Chip>O(E log V)</Chip>
                    </div>
                  </div>
                  <div className="bg-white p-4">
                    <PlayerLine name="kenj1" rating={2487} side="right" score={2} />
                    <pre className="mt-3 overflow-hidden rounded-lg bg-[#FAF0E3] p-3 font-mono text-[11px] leading-5 text-foreground/85">
{`fn shortest(g: &Graph, s: u32, t: u32) {
  let mut pq = BinaryHeap::new();
  pq.push(Reverse((0, s)));
  // ...`}
                    </pre>
                    <div className="mt-2 flex gap-1.5">
                      <Chip tone="warning">▲ 2/6 tests</Chip><Chip>Rust · 1.81</Chip>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border bg-white p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MessageSquare className="size-3.5" /> 14 spectators · &quot;GG nice approach&quot;
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-[#C62828]">Spectate <ArrowRight className="size-3.5" /></Button>
                </div>
              </Card>
              <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-border bg-white p-3 shadow-lg md:block">
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground">CURRENT STREAK</div>
                <div className="mt-0.5 flex items-baseline gap-1.5 font-display text-2xl font-semibold">
                  12 <span className="text-[11px] text-[var(--tension)]">W</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="border-y border-border bg-[var(--ivory)]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-y divide-border md:grid-cols-4 md:divide-x md:divide-y-0">
          {[
            ["Battles hosted", "1.2M+"],
            ["Active classrooms", "8,400"],
            ["Avg. submission", "180ms"],
            ["Languages", "21"],
          ].map(([l, v]) => (
            <div key={l} className="px-6 py-6">
              <div className="font-display text-2xl font-semibold tabular-nums">{v}</div>
              <div className="mt-0.5 font-mono text-[10px] tracking-[0.18em] text-muted-foreground">{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured + teasers */}
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">FEATURED · THIS WEEK</div>
          <h2 className="mt-1 font-display text-3xl font-semibold">Battles you can jump into</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { t: "Graph Wars: Bridges & Cuts", m: "3v3", d: "Hard", l: "C++", j: "4/6", tone: "tension" as const },
              { t: "Heap Heist", m: "1v1", d: "Medium", l: "TS", j: "1/2", tone: "primary" as const },
              { t: "Recursion Rumble", m: "2v2", d: "Hard", l: "Go", j: "3/4", tone: "warning" as const },
              { t: "Greedy Mornings", m: "Solo", d: "Easy", l: "Py", j: "6/16", tone: "success" as const },
            ].map((b) => (
              <Card key={b.t} className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <Chip tone={b.tone}>{b.m}</Chip>
                  <span className="font-mono text-[10px] tracking-widest text-muted-foreground">JOINED · {b.j}</span>
                </div>
                <div className="p-4">
                  <div className="font-display text-[15px] font-semibold">{b.t}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Single elimination · Best of 3 · Open registration</div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <Chip tone={b.d === "Easy" ? "success" : b.d === "Medium" ? "warning" : "danger"}>{b.d}</Chip>
                      <Chip>{b.l}</Chip>
                    </div>
                    <Button size="sm" className="bg-primary hover:bg-[#C62828]">Join</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-display font-semibold"><Trophy className="size-4 text-[#F6C445]" /> Global leaderboard</div>
              <a className="text-xs text-primary">View all →</a>
            </div>
            <div className="mt-3 divide-y divide-border">
              {PLAYERS.slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 py-2.5">
                  <div className="w-6 font-mono text-xs tabular-nums text-muted-foreground">#{i + 1}</div>
                  <Avatar className="size-7"><AvatarFallback className="bg-primary/10 text-primary text-[11px]">{p.name.split(" ").map(s => s[0]).join("")}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{p.tier}</div>
                  </div>
                  <div className="font-display text-sm font-semibold tabular-nums">{p.rating}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-[#FFF8EF] to-[#F4E8D6]/60 p-5">
              <div className="flex items-center gap-2 font-display font-semibold"><MessageSquare className="size-4 text-primary" /> Live chat · #arena-general</div>
              <div className="mt-3 space-y-2">
                {[
                  ["Theo M.", "anyone up for a 1v1? medium graph", "primary"],
                  ["Mira O.", "join my lobby — recursion drill 🔁", "warning"],
                  ["Kenji P.", "gg @aurelia, clean dijkstra", "success"],
                ].map(([n, m, t], i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className={`mt-1 size-1.5 rounded-full ${t === "primary" ? "bg-primary" : t === "warning" ? "bg-[#F6C445]" : "bg-success"}`} />
                    <div className="text-xs"><b className="text-foreground">{n}</b> <span className="text-muted-foreground">{m}</span></div>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="mt-3 w-full bg-white">Open community</Button>
            </div>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border bg-[#FFFEFB]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 md:flex-row">
          <Logo size={22} />
          <div className="text-xs text-muted-foreground">© 2026 Nullify · An original platform · Crafted for educators and competitors.</div>
        </div>
      </footer>
    </div>
  );
}

function PlayerLine({ name, rating, side, score }: { name: string; rating: number; side: "left" | "right"; score: number }) {
  return (
    <div className={`flex items-center gap-2 ${side === "right" ? "flex-row-reverse text-right" : ""}`}>
      <Avatar className="size-7 ring-2 ring-primary/20"><AvatarFallback className="bg-primary text-white text-[11px]">{name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
      <div className={side === "right" ? "text-right" : ""}>
        <div className="text-sm font-medium">{name}</div>
        <div className="font-mono text-[10px] text-muted-foreground">SR {rating}</div>
      </div>
      <div className={`${side === "left" ? "ml-auto" : "mr-auto"} font-display text-xl font-semibold tabular-nums`}>{score}</div>
    </div>
  );
}
