import { ReactNode } from "react";
import { cn } from "../ui/utils";

export function Section({ title, kicker, action, children, className }: { title?: string; kicker?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || action) && (
        <div className="flex items-end justify-between gap-3">
          <div>
            {kicker && <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{kicker}</div>}
            {title && <h2 className="font-display text-[17px] font-semibold">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Card({ children, className, glow }: { children: ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={cn(
      "relative rounded-xl border border-border bg-white",
      glow && "shadow-[0_24px_60px_-30px_rgba(229,57,53,0.28),0_2px_4px_-2px_rgba(30,27,26,0.06)]",
      !glow && "shadow-[0_1px_2px_rgba(30,27,26,0.04),0_8px_24px_-18px_rgba(30,27,26,0.12)]",
      className
    )}>
      {children}
    </div>
  );
}

export function StatTile({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: "primary" | "success" | "tension" | "warning" }) {
  const color = {
    primary: "from-primary/10 to-transparent text-primary",
    success: "from-success/10 to-transparent text-success",
    tension: "from-[var(--tension)]/10 to-transparent text-[var(--tension)]",
    warning: "from-[var(--warning)]/15 to-transparent text-[#7A5A00]",
  }[accent ?? "primary"];
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-white p-4">
      <div className={cn("absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br opacity-60", color)} />
      <div className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1.5 font-display text-[22px] font-semibold tabular-nums">{value}</div>
      {sub && <div className={cn("mt-0.5 text-xs", color)}>{sub}</div>}
    </div>
  );
}

export function Chip({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "primary" | "success" | "tension" | "warning" | "danger"; className?: string }) {
  const map = {
    neutral: "bg-muted text-foreground/80 border-border",
    primary: "bg-primary/8 text-primary border-primary/15",
    success: "bg-success/10 text-success border-success/20",
    tension: "bg-[var(--tension)]/10 text-[var(--tension)] border-[var(--tension)]/20",
    warning: "bg-[var(--warning)]/15 text-[#7A5A00] border-[var(--warning)]/30",
    danger: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wide", map[tone], className)}>{children}</span>;
}

export function ProgressRing({ value, size = 56, stroke = 6, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--border)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="url(#pg)" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
        <defs>
          <linearGradient id="pg" x1="0" x2="1">
            <stop offset="0" stopColor="#E53935" /><stop offset="1" stopColor="#F26A21" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center leading-none">
          <div className="font-display text-sm font-semibold tabular-nums">{value}%</div>
          {label && <div className="mt-0.5 font-mono text-[9px] tracking-wider text-muted-foreground">{label}</div>}
        </div>
      </div>
    </div>
  );
}

export function XPBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between font-mono text-[10px] tracking-wider text-muted-foreground">
        <span>{label ?? "XP"}</span><span className="text-foreground tabular-nums">{value.toLocaleString()} / {max.toLocaleString()}</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-[#F26A21] to-[#F6C445] shadow-[0_0_12px_rgba(229,57,53,0.45)]" style={{ width: `${pct}%` }} />
        <div className="absolute inset-y-0 left-0 w-full opacity-30" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 6px, rgba(255,255,255,0.4) 6px 7px)" }} />
      </div>
    </div>
  );
}

export function GridArt({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0" style={{
        backgroundImage:
          "linear-gradient(to right, rgba(30,27,26,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,27,26,0.04) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 80%)",
      }} />
      <div className="absolute -top-24 left-1/2 size-[520px] -translate-x-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,174,239,0.14), transparent 60%)" }} />
      <div className="absolute right-10 top-20 size-3 rotate-45 bg-[#F6C445] shadow-[0_0_14px_rgba(246,196,69,0.7)]" />
      <div className="absolute left-12 top-44 size-2 rotate-45 bg-primary/60" />
      <div className="absolute right-1/3 top-10 size-1.5 rounded-full bg-success/60" />
    </div>
  );
}
