"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { problemsApi } from "@/lib/api";

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
      if (Array.isArray(tags)) return tags.map((t: string) => <span key={t} className="bg-gray-700 text-xs px-2 py-0.5 rounded-full mr-1">{t}</span>);
    } catch { return <span className="bg-gray-700 text-xs px-2 py-0.5 rounded-full">{tagsStr}</span>; }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[80vh] flex flex-col rounded-xl overflow-hidden" style={{ background: "rgba(20,20,20,0.95)", border: "3px solid #ff6b00", boxShadow: "0 0 30px rgba(255,107,0,0.5)" }}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold" style={{ color: "#ffed4e", fontFamily: "'MK4', Impact, sans-serif" }}>Select Problems</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? <p className="text-gray-500 text-center py-8">Loading problems...</p> : (
            <div className="space-y-2">
              {problems.map((p) => {
                const isSelected = selected.some((s) => s.problemId === p.problemId);
                return (
                  <div key={p.problemId} onClick={() => toggle(p)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${isSelected ? "border-arena-orange bg-arena-orange/10" : "border-gray-800 bg-gray-900/50 hover:border-gray-600"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={isSelected} readOnly className="accent-orange-500" />
                        <span className="text-white font-medium text-sm">{p.title}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${p.difficultyLevel === "Easy" ? "bg-green-900 text-green-400" : p.difficultyLevel === "Hard" ? "bg-red-900 text-red-400" : "bg-yellow-900 text-yellow-400"}`}>
                        {p.difficultyLevel || "Medium"}
                      </span>
                    </div>
                    <div className="mt-1 ml-8 flex items-center gap-2">
                      {p.category && <span className="text-gray-500 text-xs">{p.category}</span>}
                      {renderTags(p.tags)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800 flex items-center justify-between">
          <span className="text-gray-400 text-sm">{selected.length} selected</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 text-sm">Cancel</button>
            <button onClick={handleAdd} disabled={selected.length === 0}
              className="px-4 py-2 rounded-lg bg-arena-orange text-black font-bold text-sm hover:bg-orange-600 disabled:opacity-50">Add Problems</button>
          </div>
        </div>
      </div>
    </div>
  );
}

