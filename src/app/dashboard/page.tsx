"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
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
} from "lucide-react";
import { motion } from "framer-motion";

const MENU_ITEMS = [
  {
    href: "/lessons",
    label: "บทเรียน",
    desc: "ดูหัวข้อและโจทย์การฝึกเขียนพรอมต์ที่กำหนดโดยวิทยากร",
    icon: BookOpen,
    color: "text-[#661D27]",
    bg: "bg-[#661D27]/8",
    hoverBg: "group-hover:bg-[#661D27]",
    hoverText: "group-hover:text-white",
    cta: "เข้าสู่บทเรียน",
    ctaColor: "text-[#661D27]",
    accent: "from-red-50 to-white",
  },
  {
    href: "/submit",
    label: "ส่งงานพรอมต์",
    desc: "ส่งพรอมต์ที่ฝึกเขียน พร้อมแนบภาพผลลัพธ์เพื่อให้วิทยากรตรวจ",
    icon: Send,
    color: "text-amber-700",
    bg: "bg-amber-50",
    hoverBg: "group-hover:bg-amber-500",
    hoverText: "group-hover:text-white",
    cta: "ไปยังหน้าส่งงาน",
    ctaColor: "text-amber-700",
    accent: "from-amber-50 to-white",
  },
  {
    href: "/my-submissions",
    label: "ประวัติการส่งงาน",
    desc: "ตรวจสอบรายการงานที่เคยส่งทั้งหมด พร้อมภาพประกอบแบบขยาย",
    icon: History,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    hoverBg: "group-hover:bg-emerald-600",
    hoverText: "group-hover:text-white",
    cta: "ดูประวัติทั้งหมด",
    ctaColor: "text-emerald-700",
    accent: "from-emerald-50 to-white",
  },
  {
    href: "/news",
    label: "ข่าวสาร / ประกาศ",
    desc: "ติดตามข่าวสาร คำแนะนำ และประกาศสำคัญจากการอบรม",
    icon: Newspaper,
    color: "text-blue-700",
    bg: "bg-blue-50",
    hoverBg: "group-hover:bg-blue-600",
    hoverText: "group-hover:text-white",
    cta: "อ่านข่าวสาร",
    ctaColor: "text-blue-700",
    accent: "from-blue-50 to-white",
  },
  {
    href: "/community",
    label: "ชุมชน",
    desc: "แชร์ประสบการณ์ บยกเสนอวิธีใช้ AI และแลกเปลี่ยนความรู้กับเพื่อน",
    icon: Users,
    color: "text-violet-700",
    bg: "bg-violet-50",
    hoverBg: "group-hover:bg-violet-600",
    hoverText: "group-hover:text-white",
    cta: "ไปหน้าชุมชน",
    ctaColor: "text-violet-700",
    accent: "from-violet-50 to-white",
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
    <div className="min-h-screen flex flex-col bg-[#F5F4F2]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── Welcome Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl oxblood-gradient text-white p-6 sm:p-8 shadow-xl"
        >
          {/* Subtle bg glow */}
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-black/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-300 border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                ยินดีต้อนรับสู่ระบบฝึกอบรม AI POLICE
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                สวัสดี {user.rank ? `${user.rank} ` : ""}{user.full_name}
              </h1>
              <p className="text-sm text-white/80 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                สังกัด: <span className="font-semibold text-white">{user.unit}</span>
              </p>
            </div>

            {/* Quick Stat Pill */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shrink-0 self-start sm:self-auto">
              <div className="p-2.5 bg-amber-400/20 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white tabular-nums">
                  {mySubmissions.length}
                </div>
                <div className="text-[11px] text-white/70">งานที่ส่งแล้ว</div>
              </div>

              {urgentCount > 0 && (
                <div className="flex items-center gap-3 pl-3 border-l border-white/20">
                  <div className="p-2.5 bg-red-500 rounded-xl">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-red-300 tabular-nums">{urgentCount}</div>
                    <div className="text-[11px] text-red-200">ประกาศด่วน</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Latest News / Video Section ── */}
        {latestNews.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#661D27]" />
                ประกาศ / ข่าวสารและวิดีโอล่าสุด
              </h2>
              <Link
                href="/news"
                className="text-xs font-semibold text-[#661D27] hover:underline underline-offset-2 flex items-center gap-1"
              >
                ดูทั้งหมด <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestNews.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  onClick={(clicked) => setSelectedNews(clicked)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Main Menu Cards ── */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">เมนูหลักสำหรับผู้เข้าอบรม</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MENU_ITEMS.map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i }}
              >
                <Link href={item.href}>
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm oxblood-card-hover
                                  flex flex-col h-full p-6 gap-4 group cursor-pointer">
                    {/* Icon */}
                    <div className={`w-fit p-4 rounded-2xl ${item.bg} ${item.color} ${item.hoverBg} ${item.hoverText} transition-all duration-200`}>
                      <item.icon className="w-6 h-6" />
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-[#661D27] transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>

                    {/* CTA */}
                    <div className={`text-xs font-semibold flex items-center gap-1 ${item.ctaColor}`}>
                      {item.cta}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Video Modal Popup */}
      <VideoModal
        item={selectedNews}
        onClose={() => setSelectedNews(null)}
      />

      <Footer />
    </div>
  );
}
