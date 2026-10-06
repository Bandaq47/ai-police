"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CreatePostForm from "@/components/CreatePostForm";
import PostCard from "@/components/PostCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  RefreshCw,
  ImageIcon,
  Sparkles,
  Shield,
  MessageSquare,
  Flame,
  Info,
  ChevronRight
} from "lucide-react";

export default function CommunityPage() {
  const { user, posts, fetchPosts } = useAuth();
  const router = useRouter();
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setTimeout(() => setRefreshing(false), 600);
  };

  const displayName = `${user.rank ? user.rank + " " : ""}${user.full_name}`;
  const totalLikes = posts.reduce((sum, p) => sum + (p.like_count || 0), 0);

  return (
    <div
      className="min-h-dvh bg-[#F5F4F2]"
      style={{ paddingTop: "calc(56px + env(safe-area-inset-top, 0px))" }}
    >
      <Navbar />

      <main
        className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6"
        style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7a2130] to-[#4A141B] flex items-center justify-center shadow-md text-white shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">ชุมชนตำรวจ AI</h1>
                <span className="text-sm bg-[#661D27]/10 text-[#661D27] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                  {posts.length} โพสต์
                </span>
              </div>
              <p className="text-sm text-slate-600 font-medium">
                พื้นที่แลกเปลี่ยนผลงาน พรอมต์ และประสบการณ์การใช้งาน AI สุราษฎร์ธานี
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       bg-white text-slate-700 hover:text-[#661D27] border border-slate-200/80
                       hover:border-[#661D27]/30 shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#661D27]" : ""}`} />
            <span>รีเฟรช</span>
          </button>
        </div>

        {/* ── 2-Column Responsive Layout ── */}
        {/* Desktop: Left = Main Feed (wider), Right = Compact Post Widget (Sticky) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ─────────────────────────────────────────────────────────────
              COL 1 (LEFT / MAIN FEED): Post List from all users
             ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5 order-2 lg:order-1">
            {/* Mobile-only Create Post trigger prompt */}
            <div className="block lg:hidden">
              <CreatePostForm onPostCreated={fetchPosts} />
            </div>

            {/* Feed Status Header */}
            <div className="flex items-center justify-between text-sm text-slate-600 px-1 font-medium">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Flame className="w-4.5 h-4.5 text-rose-600" />
                <span>ฟีดล่าสุดทั้งหมด</span>
              </div>
              <span className="text-xs text-slate-500">เรียงตามโพสต์ใหม่ล่าสุด</span>
            </div>

            {/* Posts List */}
            {posts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center gap-4"
              >
                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">ยังไม่มีโพสต์ในชุมชน</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                    เป็นคนแรกที่แชร์ภาพผลงานพรอมต์ หรือข้อคิดเห็นดีๆ ให้เพื่อนตำรวจในจังหวัดได้ชมกันเลย!
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-5">
                <AnimatePresence mode="popLayout">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onImageClick={(url) => setLightboxUrl(url)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              COL 2 (RIGHT SIDEBAR): Compact Create Post Widget & Info
             ───────────────────────────────────────────────────────────── */}
          <aside className="lg:col-span-5 xl:col-span-4 space-y-5 order-1 lg:order-2 lg:sticky lg:top-20">
            {/* Desktop Create Post Widget */}
            <div className="hidden lg:block">
              <CreatePostForm onPostCreated={fetchPosts} />
            </div>

            {/* User Profile Mini Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7a2130] to-[#4A141B] flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
                  {user.full_name?.charAt(0) || "ต"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 font-medium">เข้าสู่ระบบในชื่อ</p>
                  <p className="text-base font-bold text-slate-900 truncate leading-tight">
                    {displayName}
                  </p>
                  <p className="text-xs text-[#661D27] font-semibold truncate mt-0.5">
                    {user.unit}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="bg-slate-50 rounded-2xl py-2 px-3">
                  <p className="text-xs text-slate-500 font-medium">โพสต์ทั้งหมด</p>
                  <p className="text-lg font-black text-slate-800">{posts.length}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl py-2 px-3">
                  <p className="text-xs text-slate-500 font-medium">การถูกใจรวม</p>
                  <p className="text-lg font-black text-rose-600">{totalLikes}</p>
                </div>
              </div>
            </div>

            {/* Community Guidelines & Tips Card */}
            <div className="bg-gradient-to-br from-white to-slate-50/70 rounded-3xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Shield className="w-4.5 h-4.5 text-[#661D27]" />
                <span>ข้อแนะนำชุมชนสร้างสรรค์</span>
              </div>
              <ul className="text-sm text-slate-600 space-y-2.5 leading-relaxed pl-1">
                <li className="flex items-start gap-2">
                  <span className="text-[#661D27] font-bold">•</span>
                  <span>แลกเปลี่ยนเทคนิคการเขียน Prompt AI ที่ใช้ได้จริงในงานตำรวจ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#661D27] font-bold">•</span>
                  <span>สามารถกด Double-Tap ที่รูปภาพเพื่อกดถูกใจได้ทันที ❤️</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#661D27] font-bold">•</span>
                  <span>หลีกเลี่ยงการโพสต์ข้อมูลลับทางราชการหรือข้อมูลส่วนบุคคลที่ไม่ได้รับอนุญาต</span>
                </li>
              </ul>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>ภ.จว.สุราษฎร์ธานี</span>
                <span className="text-[#661D27] font-semibold">AI POLICE 2026</span>
              </div>
            </div>
          </aside>

        </div>
      </main>

      <Footer />

      {/* ── Image Lightbox Modal ── */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxUrl(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              src={lightboxUrl}
              alt="ภาพขยาย"
              className="max-w-full max-h-[92vh] rounded-2xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20
                         text-white flex items-center justify-center text-lg font-light transition-all cursor-pointer"
              title="ปิด"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
