"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/login");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center oxblood-gradient text-white">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">กำลังนำท่านเข้าสู่ระบบ AI POLICE...</h1>
        <p className="text-sm text-white/70">ตำรวจภูธรจังหวัดสุราษฎร์ธานี</p>
      </div>
    </div>
  );
}
