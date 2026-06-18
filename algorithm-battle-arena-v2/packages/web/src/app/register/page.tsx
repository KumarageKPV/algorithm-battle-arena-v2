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

          // Auto-login after registration
          const loggedInRole = await login(email, password);
          
          // Redirect based on role
          const normalized = (loggedInRole || "Student").toLowerCase();
          const next = normalized === "admin"
            ? "/admin"
            : normalized === "teacher"
              ? "/teacher"
              : "/student-dashboard";
          
          console.log('Registration successful, redirecting to:', next);
          router.push(next);
        } catch (error) {
          console.error('Registration/Login error:', error);
          // If auto-login fails, redirect to login page
          alert('Registration successful! Please login.');
          router.push('/login');
        }
      }}
    />
  );
}
