import { useState } from "react";
import { Card, Chip } from "../primitives/Bits";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Search, Send, Smile, Paperclip, MoreHorizontal, Phone, Video, Pin, CheckCheck, Plus, Sparkles } from "lucide-react";

const THREADS = [
  { id: 1, n: "Devon Hill", l: "Stuck on the bridges problem", t: "2m", u: 2, status: "online", risk: "high" },
  { id: 2, n: "Mira Okafor", l: "Submitted bracket 📤", t: "1h", u: 0, status: "online", risk: "low" },
  { id: 3, n: "CS204-A · cohort", l: "Theo M.: who's hosting tonight?", t: "1h", u: 5, status: "group", risk: "" },
  { id: 4, n: "Sana Aslam", l: "Thanks for the feedback!", t: "yest", u: 0, status: "offline", risk: "low" },
  { id: 5, n: "Kenji Park", l: "🔥 12-win streak!", t: "yest", u: 0, status: "online", risk: "low" },
  { id: 6, n: "Leon Hartwell", l: "Quick question on DP memoization", t: "2d", u: 0, status: "offline", risk: "low" },
];

const MSGS = [
  { from: "Devon Hill", t: "Hi prof — I keep getting WA on the hidden cycle tests for Articulation Run.", time: "10:42", side: "left" },
  { from: "Devon Hill", t: "I think my low[] update inside the back-edge case is wrong.", time: "10:42", side: "left" },
  { from: "You", t: "Good catch — share your snippet, I'll mark it inline.", time: "10:44", side: "right" },
  { from: "Devon Hill", code: true, t: "if v != parent:\n    low[u] = disc[v]  # <- this overwrites instead of min()", time: "10:45", side: "left" },
  { from: "You", t: "Yep, that's the bug. Wrap it in min(low[u], disc[v]) and you'll clear the cycle tests.", time: "10:46", side: "right" },
  { from: "Devon Hill", t: "🙏 trying now", time: "10:46", side: "left", react: "🔥" },
];

export function TeacherChatPage() {
  const [active, setActive] = useState(1);
  const cur = THREADS.find(t => t.id === active)!;
  return (
    <div className="grid h-[calc(100vh-56px)] grid-cols-[320px_1fr_300px] bg-white">
      {/* Threads */}
      <aside className="flex flex-col border-r border-border">
        <div className="border-b border-border p-3">
          <div className="flex items-center justify-between">
            <div className="font-display font-semibold">Messages</div>
            <Button size="sm" variant="outline" className="h-7 bg-white"><Plus className="size-3.5" /> New</Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search people…" className="h-9 bg-[var(--input-background)] pl-9" />
          </div>
          <div className="mt-2 flex gap-1">
            {["All", "Unread", "Cohorts", "Pinned"].map((t, i) => (
              <button key={t} className={`h-7 rounded-md px-2 text-xs ${i === 0 ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {THREADS.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} className={`flex w-full items-start gap-3 border-b border-border px-3 py-3 text-left transition ${active === t.id ? "bg-primary/[0.05]" : "hover:bg-muted/30"}`}>
              <div className="relative">
                <Avatar className="size-10"><AvatarFallback className={`text-xs ${t.status === "group" ? "bg-[#FFF8EF] text-[var(--tension)]" : "bg-primary/10 text-primary"}`}>{t.n.split(" ").map(s => s[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                {t.status === "online" && <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-success ring-2 ring-white" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate text-sm font-medium">{t.n} {t.risk === "high" && <span className="size-1.5 rounded-full bg-[var(--tension)]" />}</div>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{t.t}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-xs text-muted-foreground">{t.l}</div>
                  {t.u > 0 && <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary font-mono text-[10px] text-white">{t.u}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Conversation */}
      <section className="flex min-w-0 flex-col bg-[var(--surface)]">
        <header className="flex items-center justify-between border-b border-border bg-white px-5 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10"><AvatarFallback className="bg-primary/10 text-primary text-xs">{cur.n.split(" ").map(s => s[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
            <div>
              <div className="font-display font-semibold leading-tight">{cur.n}</div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-success" /> Active now · CS204-A
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Chip tone="warning"><Sparkles className="size-3" /> At-risk follow-up</Chip>
            <Button size="sm" variant="outline" className="bg-white"><Phone className="size-3.5" /></Button>
            <Button size="sm" variant="outline" className="bg-white"><Video className="size-3.5" /></Button>
            <Button size="sm" variant="outline" className="bg-white"><Pin className="size-3.5" /></Button>
            <Button size="sm" variant="outline" className="bg-white"><MoreHorizontal className="size-3.5" /></Button>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="mx-auto w-fit rounded-full bg-white px-3 py-1 font-mono text-[10px] tracking-widest text-muted-foreground shadow-sm">— TUESDAY · 10:40 —</div>
          {MSGS.map((m, i) => {
            const right = m.side === "right";
            return (
              <div key={i} className={`flex gap-2 ${right ? "flex-row-reverse" : ""}`}>
                {!right && <Avatar className="size-7"><AvatarFallback className="bg-primary/10 text-primary text-[10px]">{m.from.split(" ").map(s => s[0]).join("")}</AvatarFallback></Avatar>}
                <div className={`max-w-[68%] ${right ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`rounded-2xl px-3.5 py-2 text-sm shadow-sm ${right ? "bg-primary text-white" : "bg-white text-foreground"} ${m.code ? "font-mono whitespace-pre text-[12.5px]" : ""}`}>{m.t}</div>
                  <div className={`mt-1 flex items-center gap-1 font-mono text-[10px] text-muted-foreground ${right ? "flex-row-reverse" : ""}`}>
                    {m.time}{right && <CheckCheck className="size-3 text-primary" />}
                    {(m as any).react && <span className="rounded-full border border-border bg-white px-1.5 text-[10px]">{(m as any).react} 1</span>}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex gap-0.5">
              {[0, 150, 300].map(d => <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: `${d}ms` }} />)}
            </div>
            Devon is typing…
          </div>
        </div>

        <footer className="border-t border-border bg-white p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {["Open in editor", "Schedule office hours", "Share solution outline", "🔥 Keep going!"].map(q => (
              <button key={q} className="rounded-full border border-border bg-white px-3 py-1 text-xs hover:border-primary/30 hover:text-primary">{q}</button>
            ))}
          </div>
          <div className="flex items-end gap-2 rounded-xl border border-border bg-white p-2">
            <Button size="sm" variant="ghost"><Paperclip className="size-4" /></Button>
            <Input placeholder="Reply to Devon…" className="h-9 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0" />
            <Button size="sm" variant="ghost"><Smile className="size-4" /></Button>
            <Button size="sm" className="bg-primary hover:bg-[#C62828]"><Send className="size-4" /></Button>
          </div>
        </footer>
      </section>

      {/* Student panel */}
      <aside className="hidden flex-col border-l border-border bg-white p-4 xl:flex">
        <div className="text-center">
          <Avatar className="mx-auto size-16"><AvatarFallback className="bg-primary text-white">DH</AvatarFallback></Avatar>
          <div className="mt-2 font-display text-base font-semibold">Devon Hill</div>
          <div className="font-mono text-[10px] text-muted-foreground">@devon · CS204-B · Platinum I</div>
          <div className="mt-3 flex justify-center gap-1.5">
            <Chip tone="primary">2,184 SR</Chip><Chip tone="warning">High risk</Chip>
          </div>
        </div>
        <Card className="mt-4 p-3">
          <div className="font-mono text-[10px] tracking-widest text-muted-foreground">RECENT ACTIVITY</div>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex justify-between"><span>Articulation Run</span><span className="text-destructive">2 fails</span></div>
            <div className="flex justify-between"><span>Knapsack Rerolled</span><span className="text-success">Solved</span></div>
            <div className="flex justify-between"><span>Two-Pointer Drift</span><span className="text-muted-foreground">Skipped</span></div>
          </div>
        </Card>
        <Card className="mt-3 p-3">
          <div className="font-mono text-[10px] tracking-widest text-muted-foreground">NOTES</div>
          <div className="mt-1.5 rounded-md bg-amber-50 p-2 text-xs text-[#a16207]">Prefers Python · works best in evenings · low confidence on graphs.</div>
        </Card>
      </aside>
    </div>
  );
}
