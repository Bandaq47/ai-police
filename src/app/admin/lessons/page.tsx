"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Plus, Trash2, Search, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLessonsPage() {
  const { user, lessons, addLesson, deleteLesson } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) router.push("/login");
    else if (user.role !== "admin") router.push("/dashboard");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setLoading(true);
    const success = await addLesson(title, description);
    setLoading(false);

    if (success) {
      setTitle("");
      setDescription("");
      alert("เพิ่มบทเรียนสำเร็จ");
    } else {
      alert("เกิดข้อผิดพลาดในการเพิ่มบทเรียน");
    }
  };

  const handleDelete = async (id: string, lessonTitle: string) => {
    if (!window.confirm(`คุณต้องการลบบทเรียน "${lessonTitle}" ใช่หรือไม่?`)) return;
    const success = await deleteLesson(id);
    if (!success) {
      alert("เกิดข้อผิดพลาดในการลบบทเรียน");
    }
  };

  const filteredLessons = lessons.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4F2]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[11px] font-bold mb-2 tracking-wide uppercase">
              <BookOpen className="w-3.5 h-3.5" />
              Lesson Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              จัดการบทเรียนการอบรม
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              กำหนดหัวข้อและโจทย์การฝึกเขียนพรอมต์สำหรับผู้เข้าอบรม (พบทั้งหมด {lessons.length} บทเรียน)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Lesson Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 sticky top-24">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="p-2 bg-[#661D27]/10 rounded-xl">
                  <Plus className="w-5 h-5 text-[#661D27]" />
                </div>
                <h2 className="font-bold text-lg text-slate-800">เพิ่มบทเรียนใหม่</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    ชื่อบทเรียน / หัวข้อ
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 1. การใช้พรอมต์สร้างภาพ (AI Image Generation)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#661D27]/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    รายละเอียดคำแนะนำ / โจทย์
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="รายละเอียดเพิ่มเติมของบทเรียน วิธีการฝึกปฏิบัติตามโจทย์..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#661D27]/20 text-sm leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 oxblood-gradient text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {loading ? "กำลังบันทึก..." : "เพิ่มบทเรียน"}
                </button>
              </form>
            </div>
          </div>

          {/* Lessons List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาบทเรียนตามชื่อหรือคำอธิบาย..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#661D27]/20 shadow-sm"
              />
            </div>

            {filteredLessons.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-500 shadow-sm">
                ไม่พบบทเรียนที่ค้นหา
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLessons.map((lesson, idx) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-xl bg-[#661D27]/10 text-[#661D27] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base leading-snug flex items-center gap-2">
                            {lesson.title}
                            <Sparkles className="w-4 h-4 text-amber-500 inline" />
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed mt-1">
                            {lesson.description}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(lesson.id, lesson.title)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl shrink-0 transition-colors"
                        title="ลบบทเรียน"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        พร้อมใช้งานในระบบ
                      </span>
                      {lesson.created_at && (
                        <span>
                          เพิ่มเมื่อ {new Date(lesson.created_at).toLocaleDateString("th-TH")}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
