"use client";
import { useRouter } from "next/navigation";
import { AuthPage } from "@/components/screens/AuthPages";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Toast } from "@/components/ui/toast";
import { useState } from "react";

export default function RegisterPage() {
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
        mode="register"
        onSwitch={(m) => router.push(`/${m === "login" ? "login" : "register"}`)}
        onAuth={async ({ email, password, firstName, lastName, passwordConfirm, role }) => {
          try {
            const payload = {
              email,
              password,
              passwordConfirm,
              firstName,
              lastName,
            };

            // Register the user
            if (role === "Teacher") {
              await authApi.registerTeacher(payload);
            } else {
              await authApi.registerStudent(payload);
            }

            // Auto-login after successful registration
            try {
              const loggedInRole = await login(email, password);
              const normalized = (loggedInRole || "Student").toLowerCase();
              const next = normalized === "admin"
                ? "/admin"
                : normalized === "teacher"
                  ? "/teacher"
                  : "/student-dashboard";
              
              router.push(next);
            } catch (loginError) {
              console.error('Auto-login failed:', loginError);
              setToast({ message: "Registration successful! Redirecting to login...", type: "success" });
              setTimeout(() => router.push('/login'), 2000);
            }
          } catch (error: any) {
            console.error('Registration error:', error);
            const message = error?.response?.data?.message || 'Registration failed. Please try again.';
            setToast({ message, type: "error" });
          }
        }}
      />
    </>
  );
}
