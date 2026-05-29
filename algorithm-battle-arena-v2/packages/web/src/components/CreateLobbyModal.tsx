"use client";
import { useState, useEffect } from "react";
import { X, Users } from "lucide-react";

interface Props { isOpen: boolean; onClose: () => void; onCreate: (data: { name: string; maxPlayers: number; mode: string; difficulty: string }) => void; }

export default function CreateLobbyModal({ isOpen, onClose, onCreate }: Props) {
  const [name, setName] = useState("New Lobby");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [mode, setMode] = useState("1v1");

  useEffect(() => { if (mode === "1v1") setMaxPlayers(2); }, [mode]);

  if (!isOpen) return null;

  const handleSubmit = () => { if (name.trim()) onCreate({ name, maxPlayers, mode, difficulty: "Medium" }); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-lg p-6" style={{ background: "rgba(20,20,20,0.95)", border: "3px solid #ff6b00", boxShadow: "0 0 30px rgba(255,107,0,0.5)" }}>
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 rounded-lg overflow-hidden">
          <div className="w-full h-full" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)" }} />
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 hover:opacity-80 p-2" style={{ color: "#ff3366" }}><X size={24} /></button>

        <h2 className="text-center mb-6" style={{ fontFamily: "'MK4', Impact, sans-serif", fontSize: "2rem", color: "#ffed4e", textShadow: "2px 2px 0px #ff6b00, 4px 4px 0px #000" }}>
          CREATE LOBBY
        </h2>

        <div className="space-y-4 relative z-10">
          <div>
            <label className="block text-sm mb-1" style={{ color: "#ccc", fontFamily: "'Courier New', monospace" }}>LOBBY NAME</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-lg text-white" style={{ background: "rgba(40,40,40,0.9)", border: "2px solid #666", fontFamily: "'Courier New', monospace", fontSize: "1.1rem" }} />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: "#ccc", fontFamily: "'Courier New', monospace" }}>GAME MODE</label>
            <div className="grid grid-cols-3 gap-2">
              {["1v1", "2v2", "FFA"].map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className="py-3 rounded-lg font-bold text-center transition-all"
                  style={{
                    background: mode === m ? "linear-gradient(135deg, #ff6b00, #ff4d4d)" : "rgba(40,40,40,0.9)",
                    border: mode === m ? "2px solid #ffed4e" : "2px solid #666",
                    color: mode === m ? "#fff" : "#999",
                    fontFamily: "'Courier New', monospace", fontSize: "1.1rem",
                    boxShadow: mode === m ? "0 0 15px rgba(255,107,0,0.5)" : "none",
                  }}>{m}</button>
              ))}
            </div>
          </div>

          {mode !== "1v1" && (
            <div>
              <label className="block text-sm mb-1" style={{ color: "#ccc", fontFamily: "'Courier New', monospace" }}>MAX PLAYERS: {maxPlayers}</label>
              <input type="range" min={2} max={20} value={maxPlayers} onChange={(e) => setMaxPlayers(parseInt(e.target.value))} className="w-full accent-orange-500" />
            </div>
          )}

          <button onClick={handleSubmit}
            className="w-full py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #ff6b00, #ff4d4d)",
              color: "#fff", fontFamily: "'MK4', Impact, sans-serif", letterSpacing: "0.1em",
              boxShadow: "0 0 20px rgba(255,107,0,0.5)", border: "2px solid #ffed4e",
            }}>
            <Users className="inline mr-2" size={20} />CREATE LOBBY
          </button>
        </div>
      </div>
    </div>
  );
}

