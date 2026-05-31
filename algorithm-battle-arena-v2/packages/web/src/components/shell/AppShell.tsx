import { ReactNode } from "react";
import { Logo } from "../brand/Logo";
import { cn } from "../ui/utils";
import {
  Bell, Search, Swords, Trophy, Users, LayoutDashboard, MessageSquare,
  Plus, Flame, ChevronRight, Settings, Shield, GraduationCap, BookOpen, LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export type ViewId =
  | "landing" | "login" | "register"
  | "student" | "teacher" | "admin"
  | "create" | "host" | "lobby" | "lobbyInstance" | "match"
  | "leaderboard" | "manage" | "chat";

export const ROLE_NAV: Record<"student" | "teacher" | "admin", { id: ViewId; label: string; icon: any; href: string }[]> = {
  student: [
    { id: "student", label: "Home Base", icon: LayoutDashboard, href: "/student-dashboard" },
    { id: "lobby", label: "Arenas", icon: Swords, href: "/lobby" },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
    { id: "chat", label: "Messages", icon: MessageSquare, href: "/chat" },
  ],
  teacher: [
    { id: "teacher", label: "Command Center", icon: LayoutDashboard, href: "/teacher" },
    { id: "manage", label: "Students", icon: Users, href: "/manage-students" },
    { id: "create", label: "Challenges", icon: BookOpen, href: "/create-challenge" },
    { id: "host", label: "Host Battle", icon: Swords, href: "/host-battle" },
    { id: "chat", label: "Messages", icon: MessageSquare, href: "/teacher-chat" },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
  ],
  admin: [
    { id: "admin", label: "Console", icon: Shield, href: "/admin" },
    { id: "manage", label: "Members", icon: Users, href: "/manage-members" },
    { id: "lobby", label: "Live Arenas", icon: Swords, href: "/lobby" },
    { id: "leaderboard", label: "Rankings", icon: Trophy, href: "/leaderboard" },
  ],
};

export function AppShell({
  role,
  current,
  children,
  hud,
}: {
  role: "student" | "teacher" | "admin";
  current: ViewId;
  children: ReactNode;
  hud?: boolean;
}) {
  const router = useRouter();
  const nav = ROLE_NAV[role];
  const { logout, user } = useAuth();

  const onNav = (viewId: ViewId) => {
    const route = nav.find(n => n.id === viewId)?.href || "/";
    router.push(route);
  };

  return (
    <div className={cn("flex min-h-screen w-full", hud ? "bg-[var(--surface)]" : "bg-[var(--surface)]")}>
      {/* Sidebar */}
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-border bg-white/80 backdrop-blur md:flex">
        <div className="px-5 pt-5 pb-4"><Logo /></div>
        <div className="px-3">
          <button className="group flex w-full items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-left text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground">
            <span className="flex items-center gap-2"><Search className="size-3.5" /> Quick search</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">⌘K</kbd>
          </button>
        </div>
        <nav className="mt-4 flex-1 px-3">
          <div className="px-2 pb-2 font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
            {role.toUpperCase()} · WORKSPACE
          </div>
          <ul className="space-y-1">
            {nav.map((n) => {
              const active = current === n.id;
              const Icon = n.icon;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => onNav(n.id)}
                    className={cn(
                      "group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary" />}
                    <Icon className="size-4" />
                    <span className="flex-1 text-left">{n.label}</span>
                    {n.id === "chat" && <span className="rounded-full bg-tension/10 px-1.5 text-[10px] font-medium text-[var(--tension)]">3</span>}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 rounded-xl border border-[#E53935]/20 bg-gradient-to-br from-[#E53935]/6 via-[#FFFEFB] to-[#F6C445]/6 p-3">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-primary">
              <Flame className="size-3.5" /> SEASON · OBSIDIAN
            </div>
            <div className="mt-2 text-sm font-medium">Climb to Diamond II</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E2D3C0]">
              <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-[#E53935] to-[#F26A21]" />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
              <span>1,240 / 1,800 SR</span><span className="text-primary">+45 today</span>
            </div>
          </div>
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2">
            <Avatar className="size-8 ring-2 ring-primary/20"><AvatarFallback className="bg-primary text-white">{user?.fullName?.split(" ").map(x => x[0]).join("") || "ME"}</AvatarFallback></Avatar>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium leading-tight truncate">{user?.fullName || "Aurelia Vance"}</div>
              <div className="font-mono text-[10px] text-muted-foreground truncate">{user?.email || "Diamond II"}</div>
            </div>
            <button onClick={() => { logout(); router.push("/"); }} className="grid size-7 place-items-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Sign Out">
               <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-white/85 px-4 backdrop-blur md:px-6">
          <div className="md:hidden"><Logo size={24} /></div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden md:inline">Workspace</span>
            <ChevronRight className="hidden size-3 md:inline" />
            <span className="font-medium text-foreground capitalize">{labelFor(current)}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <RoleSwitcher role={role} onChange={(r) => {
               const base = r === "student" ? "/student-dashboard" : r === "teacher" ? "/teacher" : "/admin";
               router.push(base);
            }} />
            <button className="hidden h-9 items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 text-sm hover:bg-muted md:flex">
              <Plus className="size-4 text-primary" /> New
            </button>
            <button className="relative grid size-9 place-items-center rounded-lg border border-border bg-white hover:bg-muted">
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[var(--tension)]" />
            </button>
            <Badge className="hidden gap-1 border-success/30 bg-success/10 text-success md:inline-flex" variant="outline">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />Online · 312
            </Badge>
          </div>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function labelFor(v: ViewId) {
  return {
    landing: "Landing", login: "Sign in", register: "Create account",
    student: "Home Base", teacher: "Command Center", admin: "Admin Console",
    create: "Create challenge", host: "Host battle", lobby: "Arenas",
    lobbyInstance: "Lobby", match: "Live match", leaderboard: "Leaderboard",
    manage: "Students", chat: "Messages",
  }[v];
}

function RoleSwitcher({ role, onChange }: { role: string; onChange: (r: "student" | "teacher" | "admin") => void }) {
  const items: ("student" | "teacher" | "admin")[] = ["student", "teacher", "admin"];
  const icons = { student: GraduationCap, teacher: BookOpen, admin: Shield };
  return (
    <div className="hidden rounded-lg border border-border bg-white p-0.5 md:flex">
      {items.map((r) => {
        const Icon = icons[r];
        const active = role === r;
        return (
          <button key={r} onClick={() => onChange(r)} className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-2 text-xs capitalize transition",
            active ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}>
            <Icon className="size-3.5" />{r}
          </button>
        );
      })}
    </div>
  );
}
