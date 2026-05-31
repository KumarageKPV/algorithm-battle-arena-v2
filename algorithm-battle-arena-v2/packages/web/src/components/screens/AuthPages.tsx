import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowRight, Github, Chrome, Apple, ShieldCheck } from "lucide-react";

type AuthPayload = {
  mode: "login" | "register";
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  passwordConfirm?: string;
  role?: "Student" | "Teacher";
};

export function AuthPage({ mode, onSwitch, onAuth }: {
  mode: "login" | "register";
  onSwitch: (m: "login" | "register") => void;
  onAuth: (payload: AuthPayload) => Promise<void>;
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
    <div className="min-h-screen bg-[#FFFEFB]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-8 py-6 md:px-14">
        <div className={`mx-auto mb-auto w-full max-w-[400px] ${isLogin ? "mt-12 py-12 md:mt-16" : "mt-2 py-6 md:mt-4 md:py-8"}`}>
          <h1 className="font-display text-[30px] font-bold leading-tight tracking-tight">
            {isLogin ? "Welcome back." : "Join the arena."}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isLogin
              ? "Sign in to continue your ranked climb."
              : "Create your account and start competing."}
          </p>

          {!isLogin && (
            <div className="mt-4 flex rounded-lg p-1.5 bg-muted/30 border border-border/50">
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

          <div className={`${isLogin ? "mt-6" : "mt-4"} grid grid-cols-3 gap-2`}>
            <Button variant="outline" className="bg-white gap-1.5"><Chrome className="size-3.5 text-primary" /> Google</Button>
            <Button variant="outline" className="bg-white gap-1.5"><Github className="size-3.5" /> GitHub</Button>
            <Button variant="outline" className="bg-white gap-1.5"><Apple className="size-3.5" /> Apple</Button>
          </div>

          <form onSubmit={handleSubmit} className={`${isLogin ? "mt-6 space-y-4" : "mt-4 space-y-3"}`}>
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

          <button
            onClick={() => onSwitch(isLogin ? "register" : "login")}
            className={`${isLogin ? "mt-5" : "mt-4"} block w-full text-center text-xs text-muted-foreground hover:text-foreground`}
          >
            {isLogin ? "New here?" : "Have an account?"}{" "}
            <span className="text-primary">{isLogin ? "Sign up →" : "Sign in →"}</span>
          </button>

          <div className={`${isLogin ? "mt-8" : "mt-5"} flex items-center justify-center gap-4 text-[11px] text-muted-foreground`}>
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-success" /> End-to-end encrypted</span>
            <span>·</span>
            <span>FERPA-aware</span>
          </div>
        </div>

        <div className="text-center text-[11px] text-muted-foreground">© 2026 Nullify</div>
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
