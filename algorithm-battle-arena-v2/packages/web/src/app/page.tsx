"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LandingPage as PremiumLandingPage } from "@/components/screens/LandingPage";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const resolveRoleRoute = () => {
    const normalized = (user?.role || "Student").toLowerCase();
    return normalized === "admin"
      ? "/admin"
      : normalized === "teacher"
        ? "/teacher"
        : "/student-dashboard";
  };

  const handleLaunch = () => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    router.push(resolveRoleRoute());
  };

  const handleHost = () => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    router.push("/host-battle");
  };

  return (
    <PremiumLandingPage
      onAuth={(m) => router.push(`/${m === "login" ? "login" : "register"}`)}
      onApp={handleLaunch}
      onHost={handleHost}
    />
  );
}
