import { useMemo, useState } from "react";
import { Logo } from "../brand/Logo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Chip } from "../primitives/Bits";
import { ArrowRight, Github, Chrome, Apple, ShieldCheck, Sparkles, Check, Swords, Trophy, Zap } from "lucide-react";

const STATS = [
  { icon: Swords, label: "Battles today", value: "8,340" },
  { icon: Trophy, label: "Ranked players", value: "142K+" },
  { icon: Zap, label: "Avg solve time", value: "186ms" },
];

type AuthPayload = {
  mode: "login" | "register";
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  passwordConfirm?: string;
  role?: "Student" | "Teacher";
};

export function AuthPage({ mode, onSwitch, onAuth, onBack }: {
  mode: "login" | "register";
  onSwitch: (m: "login" | "register") => void;
  onAuth: (payload: AuthPayload) => Promise<void>;
  onBack: () => void;
}) {
  const isLogin = mode === "login";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"Student" | "Teacher">("Student");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const canSubmit = useMemo(() => {
    if (!form.email || !form.password) return false;
    if (!isLogin) {
      return Boolean(form.firstName && form.lastName && form.passwordConfirm);
    }
    return true;
  }, [form, isLogin]);

  const update = (key: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await onAuth({
        mode,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        passwordConfirm: form.passwordConfirm,
        role,
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Authentication failed.";
      setError(typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col bg-[#FFFEFB] px-8 py-8 md:px-14">
        <div className="flex items-center justify-between">
          <button onClick={onBack}><Logo /></button>
          <button
            onClick={() => onSwitch(isLogin ? "register" : "login")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {isLogin ? "New here?" : "Have an account?"}{" "}
            <span className="text-primary">{isLogin ? "Sign up →" : "Sign in →"}</span>
          </button>
        </div>

        <div className="m-auto w-full max-w-[400px] py-12">
          <Chip tone="primary"><Sparkles className="size-3" /> Season Obsidian · Live now</Chip>
          <h1 className="mt-4 font-display text-[30px] font-bold leading-tight tracking-tight">
            {isLogin ? "Welcome back." : "Join the arena."}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isLogin
              ? "Sign in to continue your ranked climb."
              : "Create your account and start competing."}
          </p>

          {!isLogin && (
            <div className="mt-6 flex rounded-lg p-1.5 bg-muted/30 border border-border/50">
              <button
                type="button"
                onClick={() => setRole("Student")}
                className={`flex-1 rounded-md py-2 text-sm font-bold transition-all ${role === "Student" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("Teacher")}
                className={`flex-1 rounded-md py-2 text-sm font-bold transition-all ${role === "Teacher" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
              >
                Teacher
              </button>
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-2">
            <Button variant="outline" className="bg-white gap-1.5"><Chrome className="size-3.5 text-primary" /> Google</Button>
            <Button variant="outline" className="bg-white gap-1.5"><Github className="size-3.5" /> GitHub</Button>
            <Button variant="outline" className="bg-white gap-1.5"><Apple className="size-3.5" /> Apple</Button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name">
                  <Input value={form.firstName} onChange={(e) => update("firstName")(e.target.value)} placeholder="Aurelia" className="h-10 bg-[var(--input-background)]" />
                </Field>
                <Field label="Last name">
                  <Input value={form.lastName} onChange={(e) => update("lastName")(e.target.value)} placeholder="Vance" className="h-10 bg-[var(--input-background)]" />
                </Field>
              </div>
            )}
            {!isLogin && (
              <Field label="Handle" hint="Your public username">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">@</span>
                  <Input placeholder="aurelia.v" className="h-10 bg-[var(--input-background)] pl-7 pr-9" disabled />
                  <Check className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-success" />
                </div>
              </Field>
            )}
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => update("email")(e.target.value)} placeholder="you@school.edu" className="h-10 bg-[var(--input-background)]" />
            </Field>
            <Field label="Password" hint={!isLogin ? "8+ chars, one number" : undefined}>
              <Input type="password" value={form.password} onChange={(e) => update("password")(e.target.value)} placeholder="••••••••••" className="h-10 bg-[var(--input-background)]" />
            </Field>
            {!isLogin && (
              <Field label="Confirm password">
                <Input type="password" value={form.passwordConfirm} onChange={(e) => update("passwordConfirm")(e.target.value)} placeholder="••••••••••" className="h-10 bg-[var(--input-background)]" />
              </Field>
            )}

            {isLogin ? (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                  <input type="checkbox" className="accent-primary" defaultChecked /> Keep me signed in
                </label>
                <a className="text-primary hover:underline cursor-pointer">Forgot password?</a>
              </div>
            ) : (
              <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" className="mt-0.5 accent-primary" defaultChecked />
                I agree to the <a className="text-primary hover:underline">Code of Conduct</a> and fair-play rules.
              </label>
            )}

            <Button type="submit" disabled={!canSubmit || busy} className="mt-1 h-11 w-full gap-2 bg-primary hover:bg-[#C62828] text-sm">
              {busy ? "Please wait" : isLogin ? "Sign in" : "Create account"} <ArrowRight className="size-4" />
            </Button>
            {error && <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>}
          </form>

          <div className="mt-8 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-success" /> End-to-end encrypted</span>
            <span>·</span>
            <span>FERPA-aware</span>
          </div>
        </div>

        <div className="text-center text-[11px] text-muted-foreground">© 2026 Nullify</div>
      </div>

      {/* Right side — clean branded panel */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12"
        style={{ background: "linear-gradient(145deg, #FFF8EF 0%, #F4E8D6 60%, #EDD9BC 100%)" }}
      >
        {/* Subtle dot grid */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#E53935" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Accent circle */}
        <div className="pointer-events-none absolute -right-32 -top-32 size-[500px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #E53935 0%, transparent 65%)" }} />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #00AEEF 0%, transparent 65%)" }} />

        {/* Content */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-success" />
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">42,108 PLAYERS ONLINE</span>
          </div>
        </div>

        <div className="relative space-y-8">
          <div>
            <div className="font-display text-[52px] font-black leading-[1.05] tracking-tight text-foreground">
              Code.<br />
              <span className="text-primary">Compete.</span><br />
              Conquer.
            </div>
            <p className="mt-5 max-w-[300px] text-sm leading-relaxed text-muted-foreground">
              Ranked 1v1 coding battles, class tournaments, and a global leaderboard. The arena where algorithms meet adrenaline.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-border/60 bg-white/50 p-3.5 backdrop-blur">
                <Icon className="size-4 text-primary" />
                <div className="mt-2 font-display text-xl font-bold text-foreground">{value}</div>
                <div className="mt-0.5 font-mono text-[9px] tracking-widest text-muted-foreground">{label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative font-mono text-[10px] tracking-widest text-muted-foreground/60">
          NULLIFY · SEASON OBSIDIAN
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
