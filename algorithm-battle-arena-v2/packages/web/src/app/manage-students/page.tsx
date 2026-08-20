"use client";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppShell } from "@/components/shell/AppShell";
import { ManageStudentsPage as PremiumManageStudentsPage } from "@/components/screens/ManageStudentsPage";
import { useAuth } from "@/lib/auth-context";

export default function ManageStudentsRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const role = (user?.role || "Teacher").toLowerCase();
  const shellRole = role === "admin" ? "admin" : role === "teacher" ? "teacher" : "student";

  return (
    <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
      <AppShell role={shellRole} current="manage">
        <PremiumManageStudentsPage onChat={() => router.push("/teacher-chat")} />
      </AppShell>
    </ProtectedRoute>
  );
}
