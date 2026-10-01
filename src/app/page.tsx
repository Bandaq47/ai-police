"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SplashScreen from "@/components/SplashScreen";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleRedirect = useCallback(() => {
    if (loading) return;
    if (user) {
      if (!user.is_onboarded) {
        router.push("/onboarding");
      } else if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        handleRedirect();
      }, 1850);
      return () => clearTimeout(timer);
    }
  }, [loading, handleRedirect]);

  return <SplashScreen onComplete={handleRedirect} />;
}
