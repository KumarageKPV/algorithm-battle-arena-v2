"use client";
import { useRouter } from "next/navigation";
import { AuthPage } from "@/components/screens/AuthPages";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/useToast";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();

  return (
    <AuthPage
      mode="register"
      onSwitch={(m) => router.push(`/${m === "login" ? "login" : "register"}`)}
      onAuth={async ({ email, password, firstName, lastName, passwordConfirm, role }) => {
        const payload = {
          email,
          password,
          passwordConfirm,
          firstName: firstName || "",
          lastName: lastName || "",
        };

        // Register the user
        if (role === "Teacher") {
          await authApi.registerTeacher(payload);
        } else {
          await authApi.registerStudent(payload);
        }

        toast.success("Registration successful! Logging you in...");

        // Auto-login after successful registration
        try {
          await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for user feedback
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
          toast.info("Please login with your credentials");
          setTimeout(() => router.push('/login'), 1500);
        }
      }}
    />
  );
}
