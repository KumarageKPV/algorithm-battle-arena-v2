"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppShell } from "@/components/shell/AppShell";
import { AdminDashboard as PremiumAdminDashboard } from "@/components/screens/AdminDashboard";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AppShell role="admin" current="admin">
        <PremiumAdminDashboard />
      </AppShell>
    </ProtectedRoute>
  );
}
