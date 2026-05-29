"use client";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { problemsApi } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

export default function CreateChallengePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [category, setCategory] = useState("");
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await problemsApi.upsert({ title, description, difficultyLevel: difficulty, category }); toast.success("Problem created successfully!"); setTitle(""); setDescription(""); setCategory(""); }
    catch { toast.error("Failed to create problem"); }
  };

  const inputStyle = { background: "rgba(40,40,40,0.9)", border: "2px solid #666", fontFamily: "'Courier New', monospace", fontSize: "1rem" };

  return (
    <ProtectedRoute allowedRoles={["Admin", "Teacher"]}>
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #111827 0%, #1a0000 50%, #000 100%)" }}>
        <div className="p-6">
          <h1 className="mb-6 select-none" style={{ fontFamily: "'MK4', Impact, sans-serif", fontSize: "2.5rem", color: "#ffed4e", textShadow: "3px 3px 0px #ff6b00, 6px 6px 0px #000" }}>
            CREATE CHALLENGE
          </h1>
          <form onSubmit={handleSubmit} className="max-w-2xl rounded-xl p-6 space-y-4" style={{ background: "rgba(20,20,20,0.85)", border: "2px solid #ff6b00" }}>
            <div>
              <label className="block text-sm mb-1" style={{ color: "#ccc", fontFamily: "'Courier New', monospace" }}>PROBLEM TITLE</label>
              <input type="text" required placeholder="Problem Title" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-white focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "#ccc", fontFamily: "'Courier New', monospace" }}>DESCRIPTION (supports markdown)</label>
              <textarea required placeholder="Problem Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={8}
                className="w-full px-4 py-3 rounded-lg text-white focus:outline-none resize-y" style={inputStyle} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: "#ccc", fontFamily: "'Courier New', monospace" }}>DIFFICULTY</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-white focus:outline-none" style={inputStyle}>
                  <option>Easy</option><option>Medium</option><option>Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "#ccc", fontFamily: "'Courier New', monospace" }}>CATEGORY</label>
                <input type="text" placeholder="e.g., Arrays, Sorting" value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-white focus:outline-none" style={inputStyle} />
              </div>
            </div>
            <button type="submit"
              className="w-full py-4 rounded-lg font-bold transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #ff6b00, #ff4d4d)", color: "#fff", fontFamily: "'MK4', Impact, sans-serif", fontSize: "1.3rem", letterSpacing: "0.15em", boxShadow: "0 0 20px rgba(255,107,0,0.5)", border: "2px solid #ffed4e" }}>
              CREATE CHALLENGE
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
