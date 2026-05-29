"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppShell } from "@/components/shell/AppShell";
import { StudentDashboard as PremiumStudentDashboard } from "@/components/screens/StudentDashboard";

export default function StudentDashboard() {
  const router = useRouter();

  return (
    <ProtectedRoute allowedRoles={["Student"]}>
      <AppShell role="student" current="student">
        <PremiumStudentDashboard onNav={(view) => {
          const map: Record<string, string> = {
            lobby: "/lobby",
            host: "/host-battle",
            leaderboard: "/leaderboard",
          };
          router.push(map[view] ?? "/student-dashboard");
        }} />
      </AppShell>
    </ProtectedRoute>
  );
}
