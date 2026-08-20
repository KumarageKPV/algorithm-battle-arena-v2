import { Card, Chip, Section, StatTile } from "../primitives/Bits";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { AlertTriangle, CheckCircle2, Activity, Server, ShieldAlert, Shield } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const TRAFFIC = Array.from({ length: 24 }, (_, i) => ({ h: `${i}:00`, v: 200 + Math.round(Math.sin(i / 3) * 80 + i * 6 + (i > 16 ? 90 : 0)) }));
const REGION = [{ n: "NA", v: 38, c: "#E53935" }, { n: "EU", v: 31, c: "#4D6C8A" }, { n: "APAC", v: 22, c: "#F6C445" }, { n: "LATAM", v: 9, c: "#2FA86E" }];

export function AdminDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">PLATFORM · STATUS NOMINAL</div>
          <h1 className="font-display text-[26px] font-semibold flex items-center gap-2"><Shield className="size-6 text-primary" /> Admin console</h1>
        </div>
        <div className="flex items-center gap-2">
          <Chip tone="success"><CheckCircle2 className="size-3" /> All systems · 99.98%</Chip>
          <Chip tone="warning"><AlertTriangle className="size-3" /> 2 approvals pending</Chip>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="ACTIVE USERS" value="42,108" sub="▲ 12% vs last week" accent="primary" />
        <StatTile label="BATTLES HOSTED" value="1,284" sub="today" accent="tension" />
        <StatTile label="UPTIME" value="99.98%" sub="30-day average" accent="success" />
        <StatTile label="P95 LATENCY" value="218ms" sub="judge cluster" accent="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground">CONCURRENT SESSIONS</div>
              <div className="font-display text-lg font-semibold">24h traffic</div>
            </div>
            <Chip tone="primary"><Activity className="size-3" /> Live</Chip>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={TRAFFIC} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f5" vertical={false} />
                <XAxis dataKey="h" stroke="#94a0b4" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                <YAxis stroke="#94a0b4" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e6e8ef", fontSize: 12 }} />
                <Line type="monotone" dataKey="v" stroke="#E53935" strokeWidth={2.2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground">REGION SHARE</div>
            <div className="font-display text-lg font-semibold">Players by region</div>
            <div className="flex items-center gap-4">
              <div className="h-40 w-40">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={REGION} dataKey="v" innerRadius={42} outerRadius={66} paddingAngle={3}>
                      {REGION.map((r) => <Cell key={r.n} fill={r.c} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {REGION.map(r => (
                  <div key={r.n} className="flex items-center gap-2 text-xs">
                    <span className="size-2 rounded-full" style={{ background: r.c }} />
                    <span className="flex-1">{r.n}</span>
                    <span className="font-display font-semibold tabular-nums">{r.v}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 font-display font-semibold"><ShieldAlert className="size-4 text-[var(--tension)]" /> Health alerts</div>
            <div className="mt-3 space-y-2">
              <Alert tone="warning" t="Judge cluster eu-west-2" m="Elevated latency · 540ms p95" />
              <Alert tone="danger" t="Sandbox runner #14" m="OOM — restarted automatically" />
              <Alert tone="success" t="CDN cache" m="Hit-rate 98.7% — within target" />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Approvals queue" kicker="ACTION NEEDED" action={<Button size="sm" variant="outline" className="bg-white">Approve all</Button>}>
          <Card>
            <div className="divide-y divide-border">
              {[
                ["Lin Kao", "Teacher · Westmore U.", "Verify", "warning"],
                ["Ravi Mehta", "School plan · 240 seats", "Review", "primary"],
                ["Anna Bauer", "Challenge: KMP variants", "Publish", "success"],
              ].map(([n, r, a, t], i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Avatar className="size-9"><AvatarFallback className="bg-primary/10 text-primary">{(n as string).split(" ").map(x => x[0]).join("")}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{n}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{r}</div>
                  </div>
                  <Chip tone={t as any}>{a}</Chip>
                  <Button size="sm" className="bg-primary hover:bg-[#C62828]">Open</Button>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <Section title="Top hosts · 7d" kicker="MOST BATTLES HOSTED">
          <Card>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 text-left">Host</th><th className="px-4 py-2.5 text-left">Org</th><th className="px-4 py-2.5 text-right">Battles</th><th className="px-4 py-2.5 text-right">Players</th>
              </tr></thead>
              <tbody>
                {[
                  ["Prof. Lin Kao", "Westmore U.", 48, 312],
                  ["Anna Bauer", "Code Foundry", 39, 240],
                  ["Devon Hill", "Atlas Academy", 28, 188],
                  ["Mira Okafor", "OpenCS", 22, 154],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium">{row[0]}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{row[1]}</td>
                    <td className="px-4 py-2.5 text-right font-display font-semibold tabular-nums">{row[2]}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </Section>
      </div>
    </div>
  );
}

function Alert({ tone, t, m }: { tone: "warning" | "danger" | "success"; t: string; m: string }) {
  const map = { warning: "bg-amber-50 text-[#a16207] border-amber-200", danger: "bg-red-50 text-red-700 border-red-200", success: "bg-green-50 text-green-700 border-green-200" };
  const I = tone === "success" ? CheckCircle2 : tone === "danger" ? ShieldAlert : AlertTriangle;
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 ${map[tone]}`}>
      <I className="mt-0.5 size-4" />
      <div className="flex-1 text-xs">
        <div className="font-medium">{t}</div>
        <div className="opacity-80">{m}</div>
      </div>
      <Server className="size-3.5 opacity-50" />
    </div>
  );
}
