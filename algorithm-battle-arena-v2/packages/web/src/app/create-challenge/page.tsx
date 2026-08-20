"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppShell } from "@/components/shell/AppShell";
import { CreateChallengePage as PremiumCreateChallengePage } from "@/components/screens/CreateChallengePage";
import { useAuth } from "@/lib/auth-context";

export default function CreateChallengeRoute() {
  const { user } = useAuth();
  const role = (user?.role || "Teacher").toLowerCase();
  const shellRole = role === "admin" ? "admin" : role === "teacher" ? "teacher" : "student";

  return (
    <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
      <AppShell role={shellRole} current="create">
        <PremiumCreateChallengePage />
      </AppShell>
    </ProtectedRoute>
  );
}
