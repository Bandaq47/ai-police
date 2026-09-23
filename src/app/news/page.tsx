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
    <div className="min-h-screen flex flex-col bg-[#F5F4F2]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#661D27]/10 text-[#661D27] rounded-full text-xs font-semibold">
              <Newspaper className="w-3.5 h-3.5" />
              ศูนย์ข่าวสารและสื่อการสอน AI
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ประกาศและวิดีโอจากวิทยากร (AI POLICE Media)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              คลิปวิดีโอแนะนำการใช้ AI, เอกสารดาวน์โหลด และประกาศกำหนดการส่งงาน
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาหัวข้อข่าว หรือ วิดีโอ..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#661D27]/20 shadow-sm"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-b border-slate-200/80 pb-4">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterTab === "all"
                ? "bg-[#661D27] text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            ทั้งหมด ({news.length})
          </button>

          <button
            onClick={() => setFilterTab("videos")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterTab === "videos"
                ? "bg-red-700 text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            วิดีโอ YouTube ({totalVideos})
          </button>

          {totalUrgent > 0 && (
            <button
              onClick={() => setFilterTab("urgent")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === "urgent"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-white text-red-600 hover:bg-red-50 border border-red-200"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              ประกาศด่วน ({totalUrgent})
            </button>
          )}
        </div>

        {/* Cards Grid */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 text-slate-500 shadow-sm space-y-2">
            <Newspaper className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">ไม่พบข่าวสารหรือวิดีโอที่ค้นหา</p>
            <p className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหาหรือตัวกรองด้านบน</p>
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

      <Footer />
    </div>
  );
}
