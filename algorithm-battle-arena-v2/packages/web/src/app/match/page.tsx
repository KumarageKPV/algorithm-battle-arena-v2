"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppShell } from "@/components/shell/AppShell";
import { MatchPage as PremiumMatchPage } from "@/components/screens/MatchPage";
import { useAuth } from "@/lib/auth-context";

export default function MatchRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const role = (user?.role || "Student").toLowerCase();
  const shellRole = role === "teacher" ? "teacher" : role === "admin" ? "admin" : "student";

  return (
    <ProtectedRoute allowedRoles={["Student", "Teacher", "Admin"]}>
      <AppShell role={shellRole} current="match" hud>
        <PremiumMatchPage onEnd={() => router.push("/leaderboard")} />
      </AppShell>
    </ProtectedRoute>
  );
}
