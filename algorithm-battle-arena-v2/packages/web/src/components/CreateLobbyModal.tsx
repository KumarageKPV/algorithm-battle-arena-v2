"use client";
import { useState, useEffect } from "react";
import { X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props { isOpen: boolean; onClose: () => void; onCreate: (data: { name: string; maxPlayers: number; mode: string; difficulty: string }) => void; }

export default function CreateLobbyModal({ isOpen, onClose, onCreate }: Props) {
  const [name, setName] = useState("New Lobby");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [mode, setMode] = useState("1v1");

  useEffect(() => { if (mode === "1v1") setMaxPlayers(2); }, [mode]);

  if (!isOpen) return null;

  const handleSubmit = () => { if (name.trim()) onCreate({ name, maxPlayers, mode, difficulty: "Medium" }); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-white shadow-[0_24px_80px_-35px_rgba(30,27,26,0.45)]">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">ARENAS</div>
            <h2 className="font-display text-xl font-semibold">Create lobby</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><X size={20} /></button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1 block font-mono text-[10px] tracking-widest text-muted-foreground">LOBBY NAME</label>
            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] tracking-widest text-muted-foreground">GAME MODE</label>
            <div className="grid grid-cols-3 gap-2">
              {["1v1", "2v2", "FFA"].map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`rounded-md border py-3 text-center font-display text-sm font-semibold transition ${mode === m ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-white text-foreground/70 hover:bg-muted"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {mode !== "1v1" && (
            <div>
              <div className="mb-1 flex items-center justify-between font-mono text-[10px] tracking-widest text-muted-foreground">
                <label>MAX PLAYERS</label>
                <span className="text-foreground">{maxPlayers}</span>
              </div>
              <input type="range" min={2} max={20} value={maxPlayers} onChange={(e) => setMaxPlayers(parseInt(e.target.value))} className="w-full accent-primary" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/30 p-4">
          <Button variant="outline" className="bg-white" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-[#C62828]">
            <Users className="size-4" /> Create lobby
          </Button>
        </div>
      </div>
    </div>
  );
}
