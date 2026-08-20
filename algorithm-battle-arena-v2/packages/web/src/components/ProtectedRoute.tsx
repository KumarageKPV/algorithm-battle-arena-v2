"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * HOC that checks user role against allowedRoles.
 * Redirects to /login if unauthenticated, or to role-specific dashboard if wrong role.
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to role-specific dashboard
      switch (user.role) {
        case "Student":
          router.replace("/student-dashboard");
          break;
        case "Teacher":
          router.replace("/teacher");
          break;
        case "Admin":
          router.replace("/admin");
          break;
        default:
          router.replace("/login");
      }
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen arena-bg flex items-center justify-center">
        <div className="text-arena-orange text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
