import { cn } from "../ui/utils";

export function Logo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative grid place-items-center rounded-[10px] shadow-[0_6px_20px_-8px_rgba(229,57,53,0.55)]"
        style={{
          width: size,
          height: size,
          background:
            "linear-gradient(135deg,#D81B7D 0%,#E53935 50%,#F26A21 100%)",
        }}
      >
        <svg viewBox="0 0 24 24" className="text-white" width={size * 0.6} height={size * 0.6} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6 3 12l5 6" />
          <path d="m16 6 5 6-5 6" />
          <path d="m14 4-4 16" />
        </svg>
        <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#F6C445] ring-2 ring-[#FFFEFB]" />
      </div>
      <div className="leading-none">
        <div className="font-display text-[15px] font-bold tracking-tight text-foreground">
          NULLIFY
        </div>
        <div className="mt-0.5 font-mono text-[9px] tracking-[0.2em] text-muted-foreground">CODE · COMPETE · CONQUER</div>
      </div>
    </div>
  );
}
