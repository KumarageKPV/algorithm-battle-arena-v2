"use client";
import { AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  score: number;
  problemsCompleted: number;
  totalProblems: number;
  timeRemaining: number;
}

export default function ConfirmationDialog({ isOpen, onClose, onConfirm, score, problemsCompleted, totalProblems, timeRemaining }: Props) {
  if (!isOpen) return null;
  const fmt = (ms: number) => {
    if (ms <= 0) return "00:00";
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-[0_24px_80px_-35px_rgba(30,27,26,0.45)]">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-8 w-8 text-[var(--tension)]" />
          <h2 className="font-display text-2xl font-semibold">Leave Match?</h2>
        </div>

        <div className="mb-6 space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Final Score:</span>
            <span className={`font-display text-xl font-bold ${score >= 70 ? "text-success" : score >= 40 ? "text-[#7A5A00]" : "text-destructive"}`}>{score}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Problems Completed:</span>
            <span className="font-semibold">{problemsCompleted}/{totalProblems}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Time Remaining:</span>
            <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-muted-foreground" /><span className="font-semibold">{fmt(timeRemaining)}</span></div>
          </div>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">Your current score will be saved. This action cannot be undone.</p>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-white" onClick={onClose}>Stay</Button>
          <Button className="flex-1 bg-destructive text-white hover:bg-destructive/90" onClick={onConfirm}>Leave Match</Button>
        </div>
      </div>
    </div>
  );
}

