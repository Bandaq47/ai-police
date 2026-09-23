"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LessonsPage() {
  const { user, lessons } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F8]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#661D27]/10 text-[#661D27] rounded-full text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            หัวข้อบทเรียนอบรม
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            บทเรียนการฝึกเขียนพรอมต์ (AI Lessons)
          </h1>
          <p className="text-xs text-slate-500">
            วิทยากรกำหนดหัวข้อบทเรียนสำหรับฝึกปฏิบัติ ข้าราชการตำรวจสามารถเลือกหัวข้อเหล่านี้ในหน้าส่งงาน
          </p>
        </div>

        {/* Lessons List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lessons.map((lesson, idx) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 oxblood-card-hover"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-2xl bg-[#661D27]/10 text-[#661D27] font-bold text-sm flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">{lesson.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{lesson.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  เปิดรับการส่งงาน
                </span>
                <Link
                  href={`/submit?lesson=${lesson.id}`}
                  className="px-3.5 py-1.5 bg-[#661D27] text-white rounded-xl text-xs font-semibold hover:bg-[#4A141B] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3 h-3" />
                  ฝึกเขียนบทเรียนนี้
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
