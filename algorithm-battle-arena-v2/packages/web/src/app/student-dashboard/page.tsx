"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppShell } from "@/components/shell/AppShell";
import { StudentDashboard as PremiumStudentDashboard } from "@/components/screens/StudentDashboard";
import { useAuth } from "@/lib/auth-context";
import { lobbiesApi } from "@/lib/api";

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const resolveHostRoute = () => {
    const normalized = (user?.role || "Student").toLowerCase();
    return normalized === "teacher" || normalized === "admin" ? "/host-battle" : "/lobby";
  };

  return (
    <ProtectedRoute allowedRoles={["Student"]}>
      <AppShell role="student" current="student">
        <PremiumStudentDashboard
          onNav={(view) => {
            const map: Record<string, string> = {
              lobby: "/lobby",
              leaderboard: "/leaderboard",
            };
            router.push(view === "host" ? resolveHostRoute() : map[view] ?? "/student-dashboard");
          }}
          onCreateLobby={async (data) => {
            const res = await lobbiesApi.create(data);
            const nextId = res.data?.lobbyId ?? res.data?.lobby?.lobbyId;
            if (typeof nextId === "number") {
              router.push(`/lobby/${nextId}`);
            }
          }}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
