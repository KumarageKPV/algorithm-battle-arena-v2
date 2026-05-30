import { Card, Chip, Section, StatTile } from "../primitives/Bits";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ArrowRight, Plus, Swords, BookOpen, MessageSquare, Users } from "lucide-react";
import { STUDENTS } from "../../lib/data";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Bar, BarChart } from "recharts";

const ACTIVITY = [
  { d: "Mon", subs: 84, wins: 56 }, { d: "Tue", subs: 102, wins: 71 },
  { d: "Wed", subs: 96, wins: 64 }, { d: "Thu", subs: 134, wins: 92 },
  { d: "Fri", subs: 168, wins: 121 }, { d: "Sat", subs: 88, wins: 60 }, { d: "Sun", subs: 72, wins: 48 },
];

const TOPICS = [
  { d: "Graphs", v: 78 }, { d: "DP", v: 62 }, { d: "Greedy", v: 54 }, { d: "Strings", v: 41 }, { d: "Trees", v: 70 },
];

export function TeacherDashboard({ onNav }: { onNav: (v: any) => void }) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">CS204 · ALGORITHMS</div>
          <h1 className="font-display text-[26px] font-semibold">Command center</h1>
          <p className="text-sm text-muted-foreground">Two cohorts active · 64 of 86 students online</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white" onClick={() => onNav("create")}><Plus className="size-4 text-primary" /> New challenge</Button>
          <Button className="bg-primary hover:bg-[#C62828]" onClick={() => onNav("host")}><Swords className="size-4" /> Host battle</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="ACTIVE STUDENTS" value="64 / 86" sub="74% engaged" accent="primary" />
        <StatTile label="AVG. RATING" value="2,184" sub="▲ 38 this wk" accent="success" />
        <StatTile label="AT RISK" value="7" sub="needs attention" accent="tension" />
        <StatTile label="SUBMISSIONS" value="1,284" sub="this week" accent="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground">WEEKLY ENGAGEMENT</div>
                <div className="font-display text-lg font-semibold">Submissions & wins</div>
              </div>
              <div className="flex gap-2">
                <Chip tone="primary">Submissions</Chip><Chip tone="success">Wins</Chip>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer>
                <AreaChart data={ACTIVITY} margin={{ left: -16, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#E53935" stopOpacity={0.35} /><stop offset="1" stopColor="#E53935" stopOpacity={0} /></linearGradient>
                    <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2FA86E" stopOpacity={0.3} /><stop offset="1" stopColor="#2FA86E" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef0f5" vertical={false} />
                  <XAxis dataKey="d" stroke="#94a0b4" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a0b4" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e6e8ef", fontSize: 12 }} />
                  <Area type="monotone" dataKey="subs" stroke="#E53935" strokeWidth={2} fill="url(#g1)" />
                  <Area type="monotone" dataKey="wins" stroke="#2FA86E" strokeWidth={2} fill="url(#g2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Section title="Upcoming sessions" kicker="THIS WEEK">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { t: "Live lecture · Graph theory II", d: "Tue · 14:00", chip: "primary" as const, l: "30 enrolled" },
                { t: "Class tournament · CS204-A", d: "Wed · 16:00", chip: "tension" as const, l: "Hosted by you" },
                { t: "Office hours · async DP", d: "Thu · 11:00", chip: "warning" as const, l: "Drop-in" },
                { t: "Lab · Recursion drill", d: "Fri · 14:00", chip: "success" as const, l: "Auto-graded" },
              ].map((s, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start gap-3">
                    <BookOpen className="mt-0.5 size-4 text-primary" />
                    <div className="flex-1">
                      <div className="font-display text-sm font-semibold">{s.t}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{s.l}</div>
                    </div>
                    <Chip tone={s.chip}>{s.d}</Chip>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground">TOPIC MASTERY</div>
            <div className="font-display text-lg font-semibold">Class strengths</div>
            <div className="mt-3 h-44">
              <ResponsiveContainer>
                <BarChart data={TOPICS} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef0f5" vertical={false} />
                  <XAxis dataKey="d" stroke="#94a0b4" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a0b4" fontSize={11} tickLine={false} axisLine={false} />
                  <Bar dataKey="v" fill="#E53935" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Section title="Online now" kicker={`${STUDENTS.filter(s => s.status !== "Offline").length} STUDENTS`} action={<a onClick={() => onNav("manage")} className="cursor-pointer text-xs text-primary">Manage →</a>}>
            <Card>
              <div className="divide-y divide-border">
                {STUDENTS.filter(s => s.status !== "Offline").slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="relative">
                      <Avatar className="size-7"><AvatarFallback className="bg-primary/10 text-primary text-[11px]">{s.name.split(" ").map(x => x[0]).join("")}</AvatarFallback></Avatar>
                      <span className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-white ${s.status === "In match" ? "bg-[var(--tension)] animate-pulse" : "bg-success"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{s.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{s.status} · {s.last}</div>
                    </div>
                    <div className="font-display text-xs tabular-nums">{s.rating}</div>
                  </div>
                ))}
              </div>
            </Card>
          </Section>

          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 font-display font-semibold"><MessageSquare className="size-4 text-primary" /> Recent messages</div>
              <a onClick={() => onNav("chat")} className="cursor-pointer text-xs text-primary">Inbox →</a>
            </div>
            <div className="space-y-2.5">
              {[
                ["Devon Hill", "Stuck on the bridges problem — got time?", "2m"],
                ["Mira Okafor", "Submitted tournament bracket 📤", "1h"],
                ["Sana A.", "Thanks for the feedback!", "yest"],
              ].map(([n, m, t], i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Avatar className="size-7"><AvatarFallback className="bg-[#FFF8EF] text-[var(--tension)] text-[10px]">{(n as string).split(" ").map(x => x[0]).join("")}</AvatarFallback></Avatar>
                  <div className="flex-1 text-xs">
                    <div className="flex justify-between"><b className="text-foreground">{n}</b><span className="text-muted-foreground">{t}</span></div>
                    <div className="text-muted-foreground">{m}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
