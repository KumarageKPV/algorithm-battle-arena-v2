"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppShell } from "@/components/shell/AppShell";
import { HostBattlePage as PremiumHostBattlePage } from "@/components/screens/HostBattlePage";
import { useAuth } from "@/lib/auth-context";
import { lobbiesApi } from "@/lib/api";

export default function HostBattleRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);
  const role = (user?.role || "Teacher").toLowerCase();
  const shellRole = role === "admin" ? "admin" : role === "teacher" ? "teacher" : "student";

  const handleLaunch = async (data: { name: string; maxPlayers: number; mode: string; difficulty: string }) => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await lobbiesApi.create(data);
      const nextId = res.data?.lobbyId ?? res.data?.lobby?.lobbyId;
      if (typeof nextId === "number") {
        router.push(`/lobby/${nextId}`);
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
      <AppShell role={shellRole} current="host">
        <PremiumHostBattlePage onLaunch={handleLaunch} isLaunching={creating} />
      </AppShell>
    </ProtectedRoute>
  );
}
