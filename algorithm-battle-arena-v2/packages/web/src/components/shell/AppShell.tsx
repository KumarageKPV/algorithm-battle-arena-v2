import { ReactNode } from "react";
import { Logo } from "../brand/Logo";
import { cn } from "../ui/utils";
import {
  Bell, Search, Swords, Trophy, Users, LayoutDashboard, MessageSquare,
  Flame, ChevronRight, Shield, BookOpen, LogOut, UserRound,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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
  const profileInitials = (user?.email || "ME")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "ME";

  const onNav = (viewId: ViewId) => {
    const route = nav.find(n => n.id === viewId)?.href || "/";
    router.push(route);
  };

  return (
    <div className={cn("flex min-h-screen w-full", hud ? "bg-[var(--surface)]" : "bg-[var(--surface)]")}>
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col overflow-hidden border-r border-border bg-white/80 backdrop-blur md:flex">
        <div className="px-5 pt-5 pb-4"><Logo /></div>
        <div className="px-3">
          <button className="group flex w-full items-center rounded-lg border border-border bg-white px-3 py-2 text-left text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground">
            <span className="flex items-center gap-2"><Search className="size-3.5" /> Quick search</span>
          </button>
        </div>
        <nav className="mt-4 min-h-0 flex-1 px-3">
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

      </aside>

      {/* Main */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-white/85 px-4 backdrop-blur md:px-6">
          <div className="md:hidden"><Logo size={24} /></div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden md:inline">Workspace</span>
            <ChevronRight className="hidden size-3 md:inline" />
            <span className="font-medium text-foreground capitalize">{labelFor(current)}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative grid size-9 place-items-center rounded-lg border border-border bg-white hover:bg-muted">
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[var(--tension)]" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="grid size-9 place-items-center rounded-lg border border-border bg-white transition hover:bg-muted" aria-label="Open profile menu">
                  <Avatar className="size-7 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary text-xs text-white">
                      {profileInitials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem>
                  <UserRound className="size-4" />
                  View profile
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => { logout(); router.push("/"); }}>
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">{children}</main>
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
