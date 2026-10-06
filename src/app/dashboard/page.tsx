"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import VideoModal from "@/components/VideoModal";
import { NewsItem } from "@/lib/constants";
import {
  BookOpen,
  Send,
  History,
  Newspaper,
  Bell,
  ArrowRight,
  Shield,
  CheckCircle2,
  Sparkles,
  Users,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import NewsCard from "@/components/NewsCard";

const MENU_ITEMS = [
  {
    href: "/lessons",
    label: "บทเรียน",
    desc: "หัวข้อและโจทย์ฝึกเขียนพรอมต์",
    icon: BookOpen,
    color: "#661D27",
    bg: "rgba(102,29,39,0.08)",
  },
  {
    href: "/submit",
    label: "ส่งงาน",
    desc: "ส่งพรอมต์พร้อมภาพผลลัพธ์",
    icon: Send,
    color: "#B45309",
    bg: "rgba(180,83,9,0.08)",
  },
  {
    href: "/my-submissions",
    label: "ประวัติ",
    desc: "รายการงานที่เคยส่งทั้งหมด",
    icon: History,
    color: "#047857",
    bg: "rgba(4,120,87,0.08)",
  },
  {
    href: "/news",
    label: "ข่าวสาร",
    desc: "ประกาศและข่าวสารสำคัญ",
    icon: Newspaper,
    color: "#1D4ED8",
    bg: "rgba(29,78,216,0.08)",
  },
  {
    href: "/community",
    label: "ชุมชน",
    desc: "แชร์ประสบการณ์กับเพื่อน",
    icon: Users,
    color: "#6D28D9",
    bg: "rgba(109,40,217,0.08)",
  },
  {
    href: "/ai-tools",
    label: "AI Tools",
    desc: "เครื่องมือ AI สำหรับตำรวจ",
    icon: Sparkles,
    color: "#9D174D",
    bg: "rgba(157,23,77,0.08)",
  },
];

export default function OfficerDashboardPage() {
  const { user, news, submissions } = useAuth();
  const router = useRouter();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    if (!user) router.push("/login");
    else if (user.role === "admin") router.push("/admin/dashboard");
  }, [user, router]);

  if (!user || user.role !== "officer") return null;

  const latestNews = news.slice(0, 3);
  const mySubmissions = submissions.filter((s) => s.officer_id === user.id);
  const urgentCount = news.filter((n) => n.urgent).length;

  return (
    <div
      className="min-h-screen bg-[#F5F4F2]"
      style={{ paddingTop: "calc(56px + env(safe-area-inset-top, 0px))" }}
    >
      <main
        className="w-full max-w-2xl mx-auto px-4 py-5 space-y-5 scroll-momentum"
        style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* ── Hero Banner (App-style) ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mobile-hero text-white px-5 py-5 relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-black/20 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-amber-300 border border-white/10 mb-3">
              <Sparkles className="w-3 h-3" />
              ระบบฝึกอบรม AI POLICE
            </div>

            {/* Name */}
            <h1 className="text-xl font-extrabold tracking-tight leading-snug">
              สวัสดี {user.rank ? `${user.rank} ` : ""}
              <br />
              <span className="text-2xl">{user.full_name}</span>
            </h1>
            <p className="text-xs text-white/70 flex items-center gap-1.5 mt-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {user.unit}
            </p>
          </div>

          {/* Stats row */}
          <div className="relative z-10 flex items-center gap-3 mt-4">
            <div className="flex-1 bg-white/10 rounded-2xl px-4 py-3 border border-white/15 flex items-center gap-3">
              <div className="p-2 bg-amber-400/20 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white tabular-nums leading-none">
                  {mySubmissions.length}
                </div>
                <div className="text-xs text-white/60 mt-0.5">งานที่ส่งแล้ว</div>
              </div>
            </div>

            {urgentCount > 0 && (
              <div className="flex-1 bg-white/10 rounded-2xl px-4 py-3 border border-red-400/30 flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-xl">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-red-300 tabular-nums leading-none">
                    {urgentCount}
                  </div>
                  <div className="text-xs text-red-200 mt-0.5">ประกาศด่วน</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Quick Action Grid (App-style 3x2) ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              เมนูหลัก
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {MENU_ITEMS.map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.04 * i, type: "spring", stiffness: 300 }}
              >
                <Link href={item.href} className="block tap-scale">
                  <div className="quick-action-card">
                    {/* Icon circle */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: item.bg }}
                    >
                      <item.icon
                        className="w-6 h-6"
                        style={{ color: item.color }}
                        strokeWidth={1.8}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 leading-tight">
                      {item.label}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Latest News Section ── */}
        {latestNews.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#661D27]" />
                ข่าวสารล่าสุด
              </h2>
              <Link
                href="/news"
                className="text-xs font-semibold text-[#661D27] flex items-center gap-0.5"
              >
                ดูทั้งหมด
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Horizontal scroll on mobile, grid on larger screens */}
            <div className="flex gap-3 overflow-x-auto pb-1 scroll-momentum snap-x snap-mandatory -mx-4 px-4 md:grid md:grid-cols-3 md:overflow-visible md:mx-0 md:px-0">
              {latestNews.map((item) => (
                <div
                  key={item.id}
                  className="min-w-[260px] snap-start md:min-w-0"
                >
                  <NewsCard
                    item={item}
                    onClick={(clicked) => setSelectedNews(clicked)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Quick Nav List (detailed view) ── */}
        <section>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            ทางลัด
          </h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {MENU_ITEMS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 tap-scale transition-colors active:bg-slate-50 ${
                  i < MENU_ITEMS.length - 1 ? "border-b border-slate-50" : ""
                }`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: item.bg }}
                >
                  <item.icon
                    className="w-4.5 h-4.5"
                    style={{ color: item.color, width: 18, height: 18 }}
                    strokeWidth={1.8}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Video Modal */}
      <VideoModal item={selectedNews} onClose={() => setSelectedNews(null)} />
    </div>
  );
}
