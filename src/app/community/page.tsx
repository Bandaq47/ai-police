"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CreatePostForm from "@/components/CreatePostForm";
import PostCard from "@/components/PostCard";
import { motion, AnimatePresence } from "framer-motion";
import { Users, RefreshCw, ImageIcon } from "lucide-react";

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4F2]">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8 space-y-5">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#7a2130] to-[#4A141B] flex items-center justify-center shadow-sm">
              <Users className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 leading-tight">ชุมชน</h1>
              <p className="text-xs text-slate-500">แชร์ประสบการณ์และแลกเปลี่ยนความรู้</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                       text-slate-500 hover:text-[#661D27] hover:bg-white border border-transparent
                       hover:border-slate-200 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            รีเฟรช
          </button>
        </motion.div>

        {/* ── Create Post Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <CreatePostForm onPostCreated={fetchPosts} />
        </motion.div>

        {/* ── Feed ── */}
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center justify-center py-16 gap-4"
          >
            <div className="w-16 h-16 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-slate-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500">ยังไม่มีโพสต์</p>
              <p className="text-xs text-slate-400 mt-1">เป็นคนแรกที่แชร์ให้เพื่อนดูได้เลย!</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
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
      </main>

      <Footer />

      {/* ── Image Lightbox ── */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxUrl(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              src={lightboxUrl}
              alt="Full size"
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20
                         text-white flex items-center justify-center text-xl font-light transition-all"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
