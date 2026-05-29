"use client";
import { useRouter } from "next/navigation";
import { AuthPage } from "@/components/screens/AuthPages";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  return (
    <AuthPage
      mode="register"
      onSwitch={(m) => router.push(`/${m === "login" ? "login" : "register"}`)}
      onAuth={async ({ email, password, firstName, lastName, passwordConfirm }) => {
        await authApi.registerStudent({
          email,
          password,
          passwordConfirm,
          firstName,
          lastName,
        });
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
