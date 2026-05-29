"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const role = await login(email, password);
      switch (role) {
        case "Student": router.push("/student-dashboard"); break;
        case "Teacher": router.push("/teacher"); break;
        case "Admin": router.push("/admin"); break;
        default: router.push("/");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center px-4 overflow-hidden">
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-full" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)" }} />
      </div>
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #111827 0%, #1a0000 50%, #000 100%)" }} />

      <div className="relative z-10 w-full max-w-md p-8 rounded-lg" style={{ background: "rgba(20,20,20,0.95)", border: "3px solid #ff6b00", boxShadow: "0 0 30px rgba(255,107,0,0.4)" }}>
        <h1 className="text-center mb-8 select-none" style={{ fontFamily: "'MK4', Impact, sans-serif", fontSize: "2.5rem", color: "#ffed4e", textShadow: "3px 3px 0px #ff6b00, 6px 6px 0px #000", letterSpacing: "0.08em" }}>
          LOGIN
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg" style={{ background: "rgba(220,38,38,0.15)", border: "1px solid #ef4444" }}>
            <p style={{ color: "#f87171", fontFamily: "'Courier New', monospace", fontSize: "0.9rem" }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1" style={{ color: "#ccc", fontFamily: "'Courier New', monospace", fontSize: "0.85rem", letterSpacing: "0.1em" }}>EMAIL</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-white focus:outline-none"
              style={{ background: "rgba(40,40,40,0.9)", border: "2px solid #666", fontFamily: "'Courier New', monospace", fontSize: "1rem" }}
              onFocus={(e) => (e.target.style.borderColor = "#ff6b00")} onBlur={(e) => (e.target.style.borderColor = "#666")} />
          </div>
          <div>
            <label className="block mb-1" style={{ color: "#ccc", fontFamily: "'Courier New', monospace", fontSize: "0.85rem", letterSpacing: "0.1em" }}>PASSWORD</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-lg text-white focus:outline-none"
                style={{ background: "rgba(40,40,40,0.9)", border: "2px solid #666", fontFamily: "'Courier New', monospace", fontSize: "1rem" }}
                onFocus={(e) => (e.target.style.borderColor = "#ff6b00")} onBlur={(e) => (e.target.style.borderColor = "#666")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-lg font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{
              background: loading ? "#555" : "linear-gradient(135deg, #ff6b00, #ff4d4d)",
              color: "#fff", fontFamily: "'MK4', Impact, sans-serif", fontSize: "1.3rem", letterSpacing: "0.15em",
              boxShadow: "0 0 20px rgba(255,107,0,0.5)", border: "2px solid #ffed4e",
            }}>
            {loading ? "LOGGING IN..." : "ENTER ARENA"}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontFamily: "'Courier New', monospace", color: "#999", fontSize: "0.9rem" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "#ffed4e" }} className="hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
