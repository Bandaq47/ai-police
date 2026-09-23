import React from "react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-red-900/10 bg-white/80 backdrop-blur text-slate-600 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs space-y-2">
        <div className="flex items-center justify-center gap-2 text-slate-800 font-semibold">
          <span>AI POLICE — โครงการฝึกอบรมการใช้งานปัญญาประดิษฐ์เพื่อพัฒนาประสิทธิภาพงานตำรวจ</span>
        </div>
        <p className="text-slate-500">
          ตำรวจภูธรจังหวัดสุราษฎร์ธานี • 19 สถานีตำรวจภูธรในสังกัด
        </p>
        <p className="text-slate-400 text-[11px]">
          © {new Date().getFullYear()} AI POLICE System. All rights reserved. Powered by Next.js & Supabase.
        </p>
      </div>
    </footer>
  );
}
