"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { problemsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface Problem { problemId: number; title: string; difficultyLevel?: string; category?: string; tags?: string; }
interface Props { isOpen: boolean; onClose: () => void; onAddProblems: (problems: Problem[]) => void; }

export default function ProblemBrowserModal({ isOpen, onClose, onAddProblems }: Props) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selected, setSelected] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      problemsApi.getAll({ page: "1", pageSize: "100" }).then((r) => setProblems(r.data.problems || [])).catch(() => {}).finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggle = (p: Problem) => {
    setSelected((prev) => prev.some((s) => s.problemId === p.problemId) ? prev.filter((s) => s.problemId !== p.problemId) : [...prev, p]);
  };

  const handleAdd = () => { onAddProblems(selected); setSelected([]); onClose(); };

  const renderTags = (tagsStr?: string) => {
    if (!tagsStr) return null;
    try {
      const tags = JSON.parse(tagsStr);
      if (Array.isArray(tags)) return tags.map((t: string) => <span key={t} className="mr-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">{t}</span>);
    } catch { return <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tagsStr}</span>; }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-white shadow-[0_24px_80px_-35px_rgba(30,27,26,0.45)]">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-xl font-semibold">Select Problems</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading problems...</p> : (
            <div className="space-y-2">
              {problems.map((p) => {
                const isSelected = selected.some((s) => s.problemId === p.problemId);
                return (
                  <div key={p.problemId} onClick={() => toggle(p)}
                    className={`cursor-pointer rounded-lg border p-3 transition-colors ${isSelected ? "border-primary bg-primary/10" : "border-border bg-white hover:bg-muted/40"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={isSelected} readOnly className="accent-primary" />
                        <span className="text-sm font-medium">{p.title}</span>
                      </div>
                      <span className={`rounded px-2 py-0.5 text-xs ${p.difficultyLevel === "Easy" ? "bg-success/10 text-success" : p.difficultyLevel === "Hard" ? "bg-destructive/10 text-destructive" : "bg-[var(--warning)]/15 text-[#7A5A00]"}`}>
                        {p.difficultyLevel || "Medium"}
                      </span>
                    </div>
                    <div className="mt-1 ml-8 flex items-center gap-2">
                      {p.category && <span className="text-xs text-muted-foreground">{p.category}</span>}
                      {renderTags(p.tags)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border p-4">
          <span className="text-sm text-muted-foreground">{selected.length} selected</span>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white" onClick={onClose}>Cancel</Button>
            <Button onClick={handleAdd} disabled={selected.length === 0} className="bg-primary hover:bg-[#C62828]">Add Problems</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
