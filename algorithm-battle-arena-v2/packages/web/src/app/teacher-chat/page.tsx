"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { AppShell } from "@/components/shell/AppShell";
import { TeacherChatPage as PremiumTeacherChatPage } from "@/components/screens/TeacherChatPage";
import { useAuth } from "@/lib/auth-context";

export default function TeacherChatRoute() {
  const { user } = useAuth();
  const role = (user?.role || "Teacher").toLowerCase();
  const shellRole = role === "admin" ? "admin" : role === "teacher" ? "teacher" : "student";

  return (
    <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
      <AppShell role={shellRole} current="chat">
        <PremiumTeacherChatPage />
      </AppShell>
    </ProtectedRoute>
  );
}
