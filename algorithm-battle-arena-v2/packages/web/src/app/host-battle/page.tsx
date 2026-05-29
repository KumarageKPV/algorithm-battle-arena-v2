"use client";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppShell } from "@/components/shell/AppShell";
import { HostBattlePage as PremiumHostBattlePage } from "@/components/screens/HostBattlePage";
import { useAuth } from "@/lib/auth-context";

export default function HostBattleRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const role = (user?.role || "Teacher").toLowerCase();
  const shellRole = role === "admin" ? "admin" : role === "teacher" ? "teacher" : "student";

  return (
    <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
      <AppShell role={shellRole} current="host">
        <PremiumHostBattlePage onLaunch={() => router.push("/match")} />
      </AppShell>
    </ProtectedRoute>
  );
}
