"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  Mail,
  Lock,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import img1 from "./1.png";
import img2 from "./2.png";
import img3 from "./3.png";

// ====================================================
// ✏️  CONFIGURABLE: แก้ไขข้อความและรูปภาพได้ที่นี่
// ====================================================
const SLIDES = [
  {
    image: img1.src,
    quote:
      "เรียนรู้ AI ได้ง่าย ทำความเข้าใจและเริ่มใช้งาน AI สำหรับการทำงาน",
    name: " ",
    position: " ",
  },
  {
    image: img2.src,
    quote:
      "ช่วยเพิ่มประสิทธิภาพการทำงาน ลดเวลาในการจัดทำเอกสาร วิเคราะห์ข้อมูล และเตรียมงาน ",
    name: " ",
    position: " ",
  },
  {
    image: img3.src,
    quote:
      "พัฒนาทักษะสู่ยุคดิจิทัล เรียนรู้เทคโนโลยีใหม่ เพื่อการทำงานที่ทันสมัยยิ่งขึ้น ",
    name: " ",
    position: " ",
  },
];

// ====================================================
// Component หลัก
// ====================================================
export default function LoginPage() {
  const { user, loading: authLoading, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  // If already logged in, redirect
  useEffect(() => {
    if (!authLoading && user) {
      if (!user.is_onboarded) {
        router.push("/onboarding");
      } else if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/lessons");
      }
    }
  }, [user, authLoading, router]);

  // Check for auth callback errors
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'auth_callback_error') {
      setError('การเข้าสู่ระบบด้วย Google ไม่สำเร็จ หรือยังไม่ได้เปิดใช้งาน Google Provider บนระบบ กรุณาลองใหม่อีกครั้ง');
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setError(res.message || 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้');
        setGoogleLoading(false);
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
      setGoogleLoading(false);
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen flex bg-white">
      {/* ============================================
          ซ้าย: กล่องเข้าสู่ระบบด้วย Google
          ============================================ */}
      <div className="w-full lg:w-[45%] xl:w-[42%] flex flex-col justify-center px-8 sm:px-12 xl:px-16 py-12 relative bg-white">
        {/* Logo & Brand */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#661D27]/10 flex items-center justify-center text-[#661D27]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">AI POLICE</span>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5 tracking-wide uppercase">
                ตำรวจภูธรจังหวัดสุราษฎร์ธานี
              </p>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 leading-snug">
            เข้าสู่ระบบการเรียนรู้ AI 👋
          </h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            ระบบฝึกอบรมและส่งผลงานปัญญาประดิษฐ์ (AI) สำหรับข้าราชการตำรวจและวิทยากร
          </p>
        </motion.div>

        {/* Action Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-6"
        >
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-medium leading-relaxed"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feature Badges Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ระบบเข้าสู่ระบบความปลอดภัยสูง (Single Sign-On)
            </div>
            <ul className="text-xs text-slate-500 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>เข้าสู่ระบบรวดเร็ว ไม่ต้องจำรหัสผ่านแยก</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>เชื่อมต่อกับบัญชี Google / Gmail ทันที</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>เข้าใช้งานครั้งแรก ระบบจะให้กรอกยศและสังกัดอัตโนมัติ</span>
              </li>
            </ul>
          </div>

          {/* Google Sign-In Button (Large & Prominent) */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-4 px-6 bg-white border-2 border-slate-200 hover:border-[#661D27]/40 rounded-2xl font-bold text-sm text-slate-800 shadow-md hover:shadow-xl hover:bg-slate-50/80 hover:-translate-y-0.5 active:scale-[0.99] transition-all flex items-center justify-center gap-3.5 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {googleLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-slate-300 border-t-[#661D27] rounded-full animate-spin" />
                <span>กำลังเชื่อมต่อกับ Google...</span>
              </>
            ) : (
              <>
                {/* Google SVG Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-base text-slate-800">เข้าสู่ระบบด้วย Google</span>
                <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:text-[#661D27] group-hover:translate-x-1 transition-all" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 pt-2">
            สามารถใช้บัญชี Gmail ส่วนตัว หรือบัญชีอีเมลองค์กรเข้าสู่ระบบได้
          </p>
        </motion.div>

        {/* Footer note */}
        <p className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-slate-400">
          © 2026 ตำรวจภูธรจังหวัดสุราษฎร์ธานี • ระบบ AI POLICE v1.0
        </p>
      </div>

      {/* ============================================
          ขวา: รูปภาพ + Slideshow Quote
          ============================================ */}
      <div className="hidden lg:block lg:w-[55%] xl:w-[58%] relative overflow-hidden">
        {/* Background Image with crossfade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt="background"
              className="w-full h-full object-cover"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Top Badge */}
        <div className="absolute top-8 left-8 z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium px-4 py-2 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ระบบพร้อมใช้งาน
          </div>
        </div>

        {/* Slide navigation dots — top right */}
        <div className="absolute top-8 right-8 z-10 flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentSlide(i); setIsAutoPlaying(false); }}
              className={`rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? "w-6 h-2 bg-white"
                  : "w-2 h-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        {/* Quote Card — Bottom */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute bottom-8 left-8 right-8 z-10"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-white text-sm leading-relaxed font-medium mb-4">
                &ldquo;{slide.quote}&rdquo;
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{slide.name}</p>
                  <p className="text-white/60 text-xs mt-0.5">{slide.position}</p>
                </div>

                {/* Prev / Next buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { prevSlide(); setIsAutoPlaying(false); }}
                    className="w-9 h-9 rounded-full bg-white/10 border border-white/20 hover:bg-white/25 transition-all flex items-center justify-center text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { nextSlide(); setIsAutoPlaying(false); }}
                    className="w-9 h-9 rounded-full bg-white/10 border border-white/20 hover:bg-white/25 transition-all flex items-center justify-center text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
