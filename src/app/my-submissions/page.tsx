"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightboxModal from "@/components/LightboxModal";
import { History, Send, Maximize2, Sparkles, Calendar, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function MySubmissionsPage() {
  const { user, submissions } = useAuth();
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const mySubmissions = submissions.filter((s) => s.officer_id === user.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F8]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
              <History className="w-3.5 h-3.5" />
              ประวัติการส่งงานของตนเอง
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              งานฝึกเขียนพรอมต์ที่คุณส่งเข้าระบบ
            </h1>
            <p className="text-xs text-slate-500">
              พบรายการงานทั้งหมด {mySubmissions.length} รายการ
            </p>
          </div>

          <Link
            href="/submit"
            className="px-5 py-2.5 oxblood-gradient text-white rounded-xl text-xs font-bold shadow hover:shadow-md transition-all flex items-center gap-2 w-fit"
          >
            <Send className="w-4 h-4" />
            ส่งงานบทเรียนเพิ่ม
          </Link>
        </div>

        {/* Submissions List */}
        {mySubmissions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4 max-w-md mx-auto my-8">
            <div className="p-4 bg-red-50 text-[#661D27] rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">ท่านยังไม่มีรายการส่งงานในระบบ</h3>
            <p className="text-xs text-slate-500">เริ่มฝึกเขียนพรอมต์ตามบทเรียน และส่งเข้าระบบเพื่อสะสมผลงาน</p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 oxblood-gradient text-white rounded-xl text-xs font-bold shadow hover:shadow-md transition-all"
            >
              <Send className="w-4 h-4" />
              เริ่มส่งงานแรก
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {mySubmissions.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#661D27] bg-[#661D27]/10 px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {item.lesson_title || "บทเรียนฝึกเขียนพรอมต์"}
                  </span>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.created_at).toLocaleString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                  <div className="md:col-span-3 space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 mb-1">พรอมต์ที่ฝึกเขียน (Prompt Text):</h4>
                      <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 font-mono leading-relaxed whitespace-pre-wrap">
                        {item.prompt_text}
                      </p>
                    </div>

                    {item.notes && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 mb-1">บันทึกเพิ่มเติม (Notes):</h4>
                        <p className="text-xs text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-200/50">
                          {item.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {item.image_url ? (
                    <div className="md:col-span-1 space-y-1">
                      <h4 className="text-xs font-bold text-slate-500">ภาพแนบประกอบ:</h4>
                      <div
                        onClick={() => setSelectedImage({ url: item.image_url!, title: item.lesson_title || "ภาพประกอบ" })}
                        className="relative rounded-2xl overflow-hidden border border-slate-200 cursor-pointer group max-h-48 bg-slate-900"
                      >
                        <img
                          src={item.image_url}
                          alt="Attachment preview"
                          className="w-full h-36 object-cover group-hover:scale-105 transition-transform opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                          <Maximize2 className="w-4 h-4" />
                          ขยายภาพ
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="md:col-span-1 text-center p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                      ไม่มีภาพแนบ
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {selectedImage && (
        <LightboxModal
          isOpen={!!selectedImage}
          imageUrl={selectedImage.url}
          title={selectedImage.title}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
