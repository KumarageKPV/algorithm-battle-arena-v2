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
        try {
          const role = await login(email, password);
          const normalized = (role || "Student").toLowerCase();
          const next = normalized === "admin"
            ? "/admin"
            : normalized === "teacher"
              ? "/teacher"
              : "/student-dashboard";
          console.log('Login successful, redirecting to:', next);
          router.push(next);
        } catch (error) {
          console.error('Login error:', error);
          alert('Login failed. Please check your credentials.');
        }
      }}
    />
  );
}
