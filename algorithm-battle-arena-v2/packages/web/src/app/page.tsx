"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LandingPage as PremiumLandingPage } from "@/components/screens/LandingPage";

export default function Home() {
  const router = useRouter();

  return (
    <PremiumLandingPage
      onAuth={(m) => router.push(`/${m === "login" ? "login" : "register"}`)}
      onApp={() => router.push("/student-dashboard")}
    />
  );
}
