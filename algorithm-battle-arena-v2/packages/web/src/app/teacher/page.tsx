"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { AppShell } from "@/components/shell/AppShell";
import { TeacherDashboard as PremiumTeacherDashboard } from "@/components/screens/TeacherDashboard";

export default function TeacherDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["Teacher"]}>
      <AppShell role="teacher" current="teacher">
        <PremiumTeacherDashboard onNav={() => {}} />
      </AppShell>
    </ProtectedRoute>
  );
}
