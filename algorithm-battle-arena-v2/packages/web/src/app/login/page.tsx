"use client";

import { AuthPage } from "@/components/screens/AuthPages";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  return (
    <AuthPage
      mode="login"
      onSwitch={(m) => router.push(`/${m === "login" ? "login" : "register"}`)}
      onAuth={async ({ email, password }) => {
        const role = await login(email, password);
        const normalized = (role || "Student").toLowerCase();
        const next = normalized === "admin"
          ? "/admin"
          : normalized === "teacher"
            ? "/teacher"
            : "/student-dashboard";
        router.push(next);
      }}
      onBack={() => router.push("/")}
    />
  );
}
