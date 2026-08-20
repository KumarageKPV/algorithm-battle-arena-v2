"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { AppShell } from "@/components/shell/AppShell";
import { LeaderboardPage as PremiumLeaderboardPage } from "@/components/screens/LeaderboardPage";
import { useAuth } from "@/lib/auth-context";

export default function LeaderboardRoute() {
  const { user } = useAuth();
  const role = (user?.role || "Student").toLowerCase();
  const shellRole = role === "teacher" ? "teacher" : role === "admin" ? "admin" : "student";

  return (
    <ProtectedRoute allowedRoles={["Student", "Teacher", "Admin"]}>
      <AppShell role={shellRole} current="leaderboard">
        <PremiumLeaderboardPage />
      </AppShell>
    </ProtectedRoute>
  );
}
