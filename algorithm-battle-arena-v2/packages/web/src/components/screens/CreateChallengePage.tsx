import { useState } from "react";
import { Card, Chip, Section } from "../primitives/Bits";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Check, ChevronLeft, ChevronRight, Eye, Tag, Zap, Clock, Code2, FileText, Sparkles } from "lucide-react";

const STEPS = [
  { id: 1, t: "Basics", i: FileText },
  { id: 2, t: "Constraints", i: Code2 },
  { id: 3, t: "Scoring", i: Zap },
  { id: 4, t: "Review", i: Eye },
];

export function CreateChallengePage() {
  const [step, setStep] = useState(2);
  return (
    <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">CREATE · ORIGINAL PROBLEM</div>
            <h1 className="font-display text-[26px] font-semibold">New challenge</h1>
          </div>
          <Chip tone="primary"><Sparkles className="size-3" /> Draft autosaved · 2s ago</Chip>
        </div>

        {/* Stepper */}
        <Card className="p-4">
          <ol className="grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => {
              const done = s.id < step; const active = s.id === step;
              return (
                <li key={s.id} className="relative">
                  {i < STEPS.length - 1 && <span className={`absolute left-9 right-0 top-4 -z-0 h-px ${done ? "bg-primary" : "bg-border"}`} />}
                  <button onClick={() => setStep(s.id)} className="relative z-10 flex items-center gap-2.5">
                    <span className={`grid size-8 place-items-center rounded-full border ${done ? "border-primary bg-primary text-white" : active ? "border-primary bg-white text-primary ring-4 ring-primary/15" : "border-border bg-white text-muted-foreground"}`}>
                      {done ? <Check className="size-4" /> : <s.i className="size-3.5" />}
                    </span>
                    <span className={`text-xs ${active ? "font-semibold" : "text-muted-foreground"}`}>{s.t}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card className="p-6">
          <Section kicker="STEP 2 OF 4" title="Constraints & rules">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Challenge name"><Input defaultValue="Articulation Run" className="bg-[var(--input-background)]" /></Field>
              <Field label="Time limit"><div className="relative"><Input defaultValue="30" className="bg-[var(--input-background)] pr-14" /><span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">minutes</span></div></Field>
              <Field label="Difficulty">
                <div className="flex gap-2">
                  {["Easy", "Medium", "Hard", "Elite"].map((d, i) => (
                    <button key={d} className={`h-9 flex-1 rounded-md border text-xs ${i === 2 ? "border-[var(--tension)] bg-[var(--tension)]/10 text-[var(--tension)]" : "border-border bg-white text-foreground/70 hover:bg-muted"}`}>{d}</button>
                  ))}
                </div>
              </Field>
              <Field label="Primary language">
                <div className="flex flex-wrap gap-1.5">
                  {["Python", "C++", "Java", "JS/TS", "Go", "Rust", "Any"].map((l, i) => (
                    <Chip key={l} tone={i === 1 ? "primary" : "neutral"} className="cursor-pointer">{l}</Chip>
                  ))}
                </div>
              </Field>
              <Field label="Memory limit"><div className="relative"><Input defaultValue="256" className="bg-[var(--input-background)] pr-12" /><span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">MB</span></div></Field>
              <Field label="Visibility">
                <div className="grid grid-cols-3 gap-1.5">
                  {[{ t: "Class", a: true }, { t: "Public" }, { t: "Unlisted" }].map((v) => (
                    <button key={v.t} className={`h-9 rounded-md border text-xs ${v.a ? "border-primary bg-primary/8 text-primary" : "border-border bg-white text-foreground/70"}`}>{v.t}</button>
                  ))}
                </div>
              </Field>
              <Field label="Problem statement" full hint="Markdown supported">
                <Textarea rows={5} defaultValue={"Given an undirected graph G=(V,E), find all bridges in O(V+E) time. Output the edges in lexicographic order. Stress tests reach 10^5 nodes."} className="bg-[var(--input-background)]" />
              </Field>
              <Field label="Tags" full>
                <div className="flex flex-wrap gap-1.5">
                  {["graphs", "tarjan", "bridges", "dfs", "competitive"].map(t => (
                    <Chip key={t} tone="primary"><Tag className="size-2.5" />{t}</Chip>
                  ))}
                  <button className="rounded-full border border-dashed border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground hover:border-primary hover:text-primary">+ Add tag</button>
                </div>
              </Field>
            </div>
          </Section>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))}><ChevronLeft className="size-4" /> Back</Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="size-3.5 text-success" /> 6 of 7 fields valid</div>
            <Button onClick={() => setStep(Math.min(4, step + 1))} className="bg-primary hover:bg-[#C62828]">Continue <ChevronRight className="size-4" /></Button>
          </div>
        </Card>
      </div>

      {/* Preview */}
      <aside className="space-y-4">
        <Card className="overflow-hidden">
          <div className="border-b border-border bg-gradient-to-br from-[#FFF8EF] to-[#F4E8D6]/60 p-4">
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground">LIVE PREVIEW</div>
            <h3 className="mt-1 font-display text-lg font-semibold">Articulation Run</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip tone="danger">Hard</Chip><Chip tone="primary">C++</Chip><Chip><Clock className="size-2.5" /> 30 min</Chip><Chip>graphs</Chip>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-4"><div className="font-mono text-[10px] tracking-widest text-muted-foreground">XP REWARD</div><div className="font-display text-xl font-semibold text-primary">+240</div></div>
            <div className="p-4"><div className="font-mono text-[10px] tracking-widest text-muted-foreground">SR ADJUST</div><div className="font-display text-xl font-semibold text-[var(--tension)]">±34</div></div>
          </div>
          <div className="p-4">
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground">DIFFICULTY CURVE</div>
            <div className="mt-2 grid grid-cols-12 items-end gap-0.5 h-12">
              {[2, 3, 4, 6, 8, 10, 12, 11, 9, 7, 5, 4].map((v, i) => (
                <div key={i} className={`rounded-sm ${i === 5 || i === 6 ? "bg-[var(--tension)]" : "bg-primary/30"}`} style={{ height: `${v * 7}%` }} />
              ))}
            </div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground">Calibrated to Diamond tier</div>
          </div>
        </Card>
        <div className="rounded-xl border border-dashed border-border bg-white p-4 text-xs text-muted-foreground">
          <b className="text-foreground">Tip:</b> add 3+ hidden tests for accurate SR adjustments. Players see only the sample set during a match.
        </div>
      </aside>
    </div>
  );
}

function Field({ label, hint, full, children }: { label: string; hint?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={`space-y-1.5 ${full ? "md:col-span-2" : ""}`}>
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
