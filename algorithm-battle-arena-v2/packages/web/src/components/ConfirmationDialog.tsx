"use client";
import { AlertTriangle, Clock } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-2xl shadow-2xl p-6 w-full max-w-md" style={{ background: "rgba(20,20,20,0.95)", border: "2px solid #ff6b00" }}>
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-8 w-8 text-yellow-400" />
          <h2 className="text-2xl font-bold" style={{ color: "#ffed4e", fontFamily: "'MK4', Impact, sans-serif" }}>Leave Match?</h2>
        </div>

        <div className="rounded-lg p-4 mb-6 space-y-3" style={{ background: "rgba(40,40,40,0.8)" }}>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Final Score:</span>
            <span className={`text-xl font-bold ${score >= 70 ? "text-green-400" : score >= 40 ? "text-yellow-400" : "text-red-400"}`}>{score}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Problems Completed:</span>
            <span className="text-white font-semibold">{problemsCompleted}/{totalProblems}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Time Remaining:</span>
            <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-gray-400" /><span className="text-white font-semibold">{fmt(timeRemaining)}</span></div>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-6">Your current score will be saved. This action cannot be undone.</p>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800">Stay</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold">Leave Match</button>
        </div>
      </div>
    </div>
  );
}


