"use client";

import { AuthPage } from "@/components/screens/AuthPages";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Toast } from "@/components/ui/toast";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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
            router.push(next);
          } catch (error: any) {
            console.error('Login error:', error);
            const message = error?.response?.data?.message || 'Invalid email or password. Please try again.';
            setToast({ message, type: "error" });
          }
        }}
      />
    </>
  );
}
