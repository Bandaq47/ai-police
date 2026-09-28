"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F4F2]">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#661D27]/30 border-t-[#661D27] rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-600 font-medium">
          ระบบเปลี่ยนมาใช้การเข้าสู่ระบบด้วย Google บัญชีเดียว... กำลังเปลี่ยนเส้นทาง
        </p>
      </div>
    </div>
  );
}
