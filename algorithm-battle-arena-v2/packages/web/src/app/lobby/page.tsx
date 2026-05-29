"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppShell } from "@/components/shell/AppShell";
import { LobbyPage as PremiumLobbyPage } from "@/components/screens/LobbyPage";
import { useAuth } from "@/lib/auth-context";

export default function LobbyRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const role = (user?.role || "Student").toLowerCase();
  const shellRole = role === "teacher" ? "teacher" : role === "admin" ? "admin" : "student";

  return (
    <ProtectedRoute allowedRoles={["Student", "Teacher", "Admin"]}>
      <AppShell role={shellRole} current="lobby">
        <PremiumLobbyPage
          onEnter={() => router.push("/match")}
          onHost={() => router.push("/host-battle")}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
