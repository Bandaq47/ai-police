"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminNewsForm from "@/components/AdminNewsForm";
import NewsCard from "@/components/NewsCard";
import VideoModal from "@/components/VideoModal";
import { NewsItem } from "@/lib/constants";
import { Newspaper, Trash2, CheckSquare, Square, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminNewsPage() {
  const { user, news, deleteNews } = useAuth();
  const router = useRouter();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) router.push("/login");
    else if (user.role !== "admin") router.push("/dashboard");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  // Toggle single item selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all or deselect all
  const handleSelectAll = () => {
    if (selectedIds.length === news.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(news.map((item) => item.id));
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const count = selectedIds.length;
    const confirmMsg =
      count === 1
        ? "คุณต้องการลบข่าวสาร/วิดีโอนี้ใช่หรือไม่?"
        : `คุณต้องการลบข่าวสาร/วิดีโอที่เลือกทั้งหมด ${count} รายการใช่หรือไม่?`;

    if (!window.confirm(confirmMsg)) return;

    setIsDeleting(true);
    let successCount = 0;

    for (const id of selectedIds) {
      const ok = await deleteNews(id);
      if (ok) successCount++;
    }

    setIsDeleting(false);
    setSelectedIds([]);

    if (successCount === 0) {
      alert("เกิดข้อผิดพลาดในการลบรายการ");
    }
  };

  const isAllSelected = news.length > 0 && selectedIds.length === news.length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4F2]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#661D27]/10 text-[#661D27] rounded-full text-xs font-semibold mb-1">
            <Newspaper className="w-3.5 h-3.5" />
            ระบบแอดมิน (Admin Management)
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            จัดการข่าวสาร / แนบลิงก์วิดีโอ YouTube
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            เพิ่มประกาศข่าวสาร แนบลิงก์ YouTube และเลือกติ๊กเพื่อลบข่าวสารที่ไม่ต้องการ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Component */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <AdminNewsForm />
            </div>
          </div>

          {/* List of News Cards with Checkbox Selection */}
          <div className="lg:col-span-7 space-y-4">
            {/* Header & Selection Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  disabled={news.length === 0}
                  className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#661D27] transition-colors cursor-pointer disabled:opacity-40"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-red-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>{isAllSelected ? "ยกเลิกการเลือกทั้งหมด" : "เลือกทั้งหมด"}</span>
                </button>

                <span className="text-xs text-slate-400 font-medium border-l border-slate-200 pl-3">
                  ทั้งหมด {news.length} รายการ
                </span>
              </div>

              {/* Action Toolbar when items selected */}
              <AnimatePresence>
                {selectedIds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                      เลือกแล้ว {selectedIds.length} รายการ
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isDeleting ? "กำลังลบ..." : `ลบที่เลือก (${selectedIds.length})`}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* List */}
            {news.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-sm space-y-1">
                <Newspaper className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-sm">ยังไม่มีข่าวสารในระบบ</p>
                <p className="text-xs text-slate-400">ใช้ฟอร์มด้านซ้ายเพื่อเพิ่มประกาศหรือวิดีโอใหม่</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {news.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <NewsCard
                      key={item.id}
                      item={item}
                      selectable={true}
                      selected={isSelected}
                      onToggleSelect={handleToggleSelect}
                      onClick={(clicked) => {
                        // If not clicking checkbox, open video modal
                        setSelectedNews(clicked);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Video Modal Player */}
      <VideoModal
        item={selectedNews}
        onClose={() => setSelectedNews(null)}
      />

      <Footer />
    </div>
  );
}
