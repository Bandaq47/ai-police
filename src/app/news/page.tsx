"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import VideoModal from "@/components/VideoModal";
import { NewsItem } from "@/lib/constants";
import { extractYouTubeUrl } from "@/lib/youtube-utils";
import { Newspaper, Video, AlertTriangle, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function NewsPage() {
  const { user, news } = useAuth();
  const router = useRouter();

  const [filterTab, setFilterTab] = useState<"all" | "videos" | "urgent">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const filteredNews = news.filter((item) => {
    // Filter tab
    if (filterTab === "videos" && !extractYouTubeUrl(item)) return false;
    if (filterTab === "urgent" && !item.urgent) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchBody = item.body.toLowerCase().includes(q);
      return matchTitle || matchBody;
    }
    return true;
  });

  const totalVideos = news.filter((n) => extractYouTubeUrl(n)).length;
  const totalUrgent = news.filter((n) => n.urgent).length;

  return (
    <div
      className="min-h-dvh bg-[#F5F4F2]"
      style={{ paddingTop: "calc(56px + env(safe-area-inset-top, 0px))" }}
    >
      <Navbar />

      <main
        className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
        style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#661D27]/10 text-[#661D27] rounded-full text-sm font-semibold">
              <Newspaper className="w-4 h-4" />
              ศูนย์ข่าวสารและสื่อการสอน AI
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              ประกาศและวิดีโอจากวิทยากร (AI POLICE Media)
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              คลิปวิดีโอแนะนำการใช้ AI, เอกสารดาวน์โหลด และประกาศกำหนดการส่งงาน
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาหัวข้อข่าว หรือ วิดีโอ..."
              className="w-full pl-11 pr-4 py-2.5 text-sm sm:text-base bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#661D27]/20 shadow-sm"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2.5 pt-2 border-b border-slate-200/80 pb-4">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-4.5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              filterTab === "all"
                ? "bg-[#661D27] text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            ทั้งหมด ({news.length})
          </button>

          <button
            onClick={() => setFilterTab("videos")}
            className={`px-4.5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              filterTab === "videos"
                ? "bg-red-700 text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Video className="w-4 h-4 shrink-0" />
            วิดีโอ YouTube ({totalVideos})
          </button>

          {totalUrgent > 0 && (
            <button
              onClick={() => setFilterTab("urgent")}
              className={`px-4.5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                filterTab === "urgent"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-white text-red-600 hover:bg-red-50 border border-red-200"
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              ประกาศด่วน ({totalUrgent})
            </button>
          )}
        </div>

        {/* Cards Grid */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 text-slate-500 shadow-sm space-y-2">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-base text-slate-700">ไม่พบข่าวสารหรือวิดีโอที่ค้นหา</p>
            <p className="text-sm text-slate-400">ลองเปลี่ยนคำค้นหาหรือตัวกรองด้านบน</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <NewsCard
                  item={item}
                  onClick={(clicked) => setSelectedNews(clicked)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Video Modal Player */}
      <VideoModal
        item={selectedNews}
        onClose={() => setSelectedNews(null)}
      />
    </div>
  );
}
