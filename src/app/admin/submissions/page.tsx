"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightboxModal from "@/components/LightboxModal";
import { exportSubmissionsToCSV } from "@/lib/export-csv";
import { SURAT_POLICE_STATIONS } from "@/lib/constants";
import {
  History,
  Search,
  Download,
  Filter,
  Users,
  Send,
  BookOpen,
  ImageIcon,
  Maximize2,
  Calendar,
  Sparkles,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSubmissionsPage() {
  const { user, submissions, lessons } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("ALL");
  const [selectedLesson, setSelectedLesson] = useState<string>("ALL");
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  // ─── Filter Submissions ───────────────────────────────
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // Filter by Search Query (Name, Rank, Unit, Prompt, Lesson)
      const q = searchQuery.toLowerCase().trim();
      const nameMatch =
        !q ||
        (sub.officer_name && sub.officer_name.toLowerCase().includes(q)) ||
        (sub.officer_rank && sub.officer_rank.toLowerCase().includes(q)) ||
        (sub.officer_unit && sub.officer_unit.toLowerCase().includes(q)) ||
        (sub.prompt_text && sub.prompt_text.toLowerCase().includes(q)) ||
        (sub.lesson_title && sub.lesson_title.toLowerCase().includes(q));

      // Filter by Unit / Station
      const unitMatch = selectedUnit === "ALL" || sub.officer_unit === selectedUnit;

      // Filter by Lesson
      const lessonMatch = selectedLesson === "ALL" || sub.lesson_id === selectedLesson;

      return nameMatch && unitMatch && lessonMatch;
    });
  }, [submissions, searchQuery, selectedUnit, selectedLesson]);

  // ─── Stats ──────────────────────────────────────────
  const uniqueOfficersCount = useMemo(() => {
    return new Set(filteredSubmissions.map((s) => s.officer_id)).size;
  }, [filteredSubmissions]);

  const attachedImagesCount = useMemo(() => {
    return filteredSubmissions.filter((s) => !!s.image_url).length;
  }, [filteredSubmissions]);

  const handleDownloadCSV = () => {
    exportSubmissionsToCSV(
      filteredSubmissions,
      `ai_police_submissions_export_${Date.now()}.csv`
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedUnit("ALL");
    setSelectedLesson("ALL");
  };

  const hasActiveFilters = searchQuery !== "" || selectedUnit !== "ALL" || selectedLesson !== "ALL";

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4F2]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mb-2 tracking-wide uppercase whitespace-nowrap">
              <History className="w-4 h-4" />
              Submissions Viewer
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              ดูผลงานการฝึกเขียนพรอมต์
            </h1>
            <p className="text-base text-slate-600 mt-1.5 leading-relaxed">
              เรียกดูและค้นหาผลงานของข้าราชการตำรวจ 19 สภ. จังหวัดสุราษฎร์ธานี
            </p>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-5 py-3 oxblood-gradient text-white text-sm font-bold
                       rounded-2xl shadow-md hover:shadow-lg transition-all w-fit shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4.5 h-4.5" />
            ดาวน์โหลด CSV ({filteredSubmissions.length} รายการ)
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อข้าราชการตำรวจ, ยศ, พรอมต์..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#661D27]/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            {/* Filter by Unit */}
            <div className="relative">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#661D27]/20"
              >
                <option value="ALL">สังกัด สภ. ทั้งหมด</option>
                {SURAT_POLICE_STATIONS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Lesson */}
            <div className="relative">
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#661D27]/20"
              >
                <option value="ALL">บทเรียนทั้งหมด</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-sm">
              <span className="text-slate-600">
                พบผลลัพธ์การค้นหา <strong className="text-slate-900 font-bold">{filteredSubmissions.length}</strong> รายการ
              </span>
              <button
                onClick={handleClearFilters}
                className="text-[#661D27] font-semibold hover:underline flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <X className="w-4 h-4" /> ล้างตัวกรองทั้งหมด
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-[#661D27]/10 rounded-xl text-[#661D27] shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500 font-medium whitespace-nowrap">ผลงานที่ตรงเงื่อนไข</div>
              <div className="text-xl font-extrabold text-slate-900">{filteredSubmissions.length}</div>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500 font-medium whitespace-nowrap">จำนวนตำรวจที่ส่ง</div>
              <div className="text-xl font-extrabold text-slate-900">{uniqueOfficersCount} นาย</div>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500 font-medium whitespace-nowrap">บทเรียนทั้งหมด</div>
              <div className="text-xl font-extrabold text-slate-900">{lessons.length} หัวข้อ</div>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500 font-medium whitespace-nowrap">มีภาพแนบประกอบ</div>
              <div className="text-xl font-extrabold text-slate-900">{attachedImagesCount} รายการ</div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <Filter className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-base">ไม่พบผลงานตามเงื่อนไขที่ค้นหา</h3>
            <p className="text-xs text-slate-400">ลองปรับเปลี่ยนคำค้นหา หรือเลือกสังกัดและบทเรียนอื่น</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                      {item.officer_rank ? `${item.officer_rank} ` : ""}
                      {item.officer_name || "ไม่ระบุชื่อ"}
                    </span>
                    {item.officer_unit && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm rounded-full whitespace-nowrap">
                        {item.officer_unit}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#661D27] bg-[#661D27]/10 px-3.5 py-1 rounded-full ml-auto sm:ml-0 whitespace-nowrap">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      {item.lesson_title || "บทเรียนฝึกเขียนพรอมต์"}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(item.created_at).toLocaleString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Content grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                  <div className="md:col-span-3 space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-1.5">
                        พรอมต์ที่ฝึกเขียน (Prompt Text):
                      </h4>
                      <p className="text-base text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 font-mono leading-relaxed whitespace-pre-wrap">
                        {item.prompt_text}
                      </p>
                    </div>

                    {item.notes && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-1.5">บันทึกเพิ่มเติม (Notes):</h4>
                        <p className="text-sm text-slate-700 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60 leading-relaxed">
                          {item.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Image attachment preview */}
                  {item.image_url ? (
                    <div className="md:col-span-1 space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-700">ภาพแนบประกอบ:</h4>
                      <div
                        onClick={() =>
                          setSelectedImage({
                            url: item.image_url!,
                            title: `${item.officer_rank || ""} ${item.officer_name || ""} - ${item.lesson_title || "ภาพประกอบ"}`,
                          })
                        }
                        className="relative rounded-2xl overflow-hidden border border-slate-200 cursor-pointer group max-h-48 bg-slate-900"
                      >
                        <img
                          src={item.image_url}
                          alt="Attachment preview"
                          className="w-full h-36 object-cover group-hover:scale-105 transition-transform opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-semibold gap-1.5 whitespace-nowrap">
                          <Maximize2 className="w-4 h-4" />
                          ขยายภาพ
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="md:col-span-1 text-center p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">
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
