"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, teachersApi } from "@/lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const [mode, setMode] = useState<"Student" | "Teacher">("Student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [teacherId, setTeacherId] = useState<number | undefined>();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    teachersApi.getAll().then((r) => setTeachers(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (password !== passwordConfirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      if (mode === "Student") { await authApi.registerStudent({ email, password, passwordConfirm, firstName, lastName, teacherId }); }
      else { await authApi.registerTeacher({ email, password, passwordConfirm, firstName, lastName }); }
      router.push("/login");
    } catch (err: any) { setError(err?.response?.data?.message || "Registration failed"); }
    finally { setLoading(false); }
  };

  const inputStyle = { background: "rgba(40,40,40,0.9)", border: "2px solid #666", fontFamily: "'Courier New', monospace", fontSize: "1rem" };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-full" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)" }} />
      </div>
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #111827 0%, #1a0000 50%, #000 100%)" }} />

      <div className="relative z-10 w-full max-w-lg p-8 rounded-lg" style={{ background: "rgba(20,20,20,0.95)", border: "3px solid #ff6b00", boxShadow: "0 0 30px rgba(255,107,0,0.4)" }}>
        <h1 className="text-center mb-6 select-none" style={{ fontFamily: "'MK4', Impact, sans-serif", fontSize: "2.5rem", color: "#ffed4e", textShadow: "3px 3px 0px #ff6b00, 6px 6px 0px #000" }}>
          REGISTER
        </h1>

        {/* Role Toggle */}
        <div className="flex mb-6 rounded-lg overflow-hidden" style={{ border: "2px solid #666" }}>
          {(["Student", "Teacher"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className="flex-1 py-3 font-bold transition-all"
              style={{
                background: mode === m ? "linear-gradient(135deg, #ff6b00, #ff4d4d)" : "rgba(40,40,40,0.9)",
                color: mode === m ? "#fff" : "#999",
                fontFamily: "'Courier New', monospace", fontSize: "1rem", letterSpacing: "0.1em",
                borderRight: m === "Student" ? "1px solid #666" : "none",
              }}>{m.toUpperCase()}</button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg" style={{ background: "rgba(220,38,38,0.15)", border: "1px solid #ef4444" }}>
            <p style={{ color: "#f87171", fontFamily: "'Courier New', monospace", fontSize: "0.9rem" }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" required placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-white focus:outline-none" style={inputStyle} />
            <input type="text" required placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-white focus:outline-none" style={inputStyle} />
          </div>
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-white focus:outline-none" style={inputStyle} />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-white focus:outline-none" style={inputStyle} />
          <input type="password" required placeholder="Confirm Password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-white focus:outline-none" style={inputStyle} />
          {mode === "Student" && (
            <select value={teacherId ?? ""} onChange={(e) => setTeacherId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-4 py-3 rounded-lg text-white focus:outline-none" style={inputStyle}>
              <option value="">No teacher (optional)</option>
              {teachers.map((t: any) => <option key={t.teacherId} value={t.teacherId}>{t.firstName} {t.lastName}</option>)}
            </select>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-lg font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{
              background: loading ? "#555" : "linear-gradient(135deg, #ff6b00, #ff4d4d)",
              color: "#fff", fontFamily: "'MK4', Impact, sans-serif", fontSize: "1.3rem", letterSpacing: "0.15em",
              boxShadow: "0 0 20px rgba(255,107,0,0.5)", border: "2px solid #ffed4e",
            }}>
            {loading ? "REGISTERING..." : `REGISTER AS ${mode.toUpperCase()}`}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontFamily: "'Courier New', monospace", color: "#999", fontSize: "0.9rem" }}>
          Already have an account? <Link href="/login" style={{ color: "#ffed4e" }} className="hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
