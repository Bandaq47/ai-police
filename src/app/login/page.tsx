"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const { login } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<"officer" | "admin">("officer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("กรุณากรอกอีเมล");
      return;
    }
    if (role === "officer" && !password) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }
    if (role === "admin" && !adminPassword) {
      setError("กรุณากรอกรหัสผ่านวิทยากร / ผู้ดูแลระบบ");
      return;
    }

    setLoading(true);
    try {
      const passwordToUse = role === "admin" ? adminPassword : password;
      const res = await login(email, passwordToUse);
      if (res.success) {
        router.push(role === "admin" ? "/admin/dashboard" : "/lessons");
      } else {
        setError(res.message || "รหัสผ่านหรืออีเมลไม่ถูกต้อง");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen flex bg-white">
      {/* ============================================
          ซ้าย: ฟอร์มเข้าสู่ระบบ
          ============================================ */}
      <div className="w-full lg:w-[45%] xl:w-[42%] flex flex-col justify-center px-8 sm:px-12 xl:px-16 py-12 relative bg-white">
        {/* Logo & Brand */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">AI POLICE</span>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5 tracking-wide uppercase">
                ตำรวจภูธรจังหวัดสุราษฎร์ธานี
              </p>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 leading-snug">
            ยินดีต้อนรับสำหรับการเรียนรู้ AI 👋
          </h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            เข้าสู่ระบบเพื่อเริ่มการเรียนรู้ AI
          </p>
        </motion.div>

        {/* Role Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => { setRole("officer"); setError(""); }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                role === "officer"
                  ? "bg-white text-[#661D27] shadow-sm shadow-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              ข้าราชการตำรวจ
            </button>
            <button
              type="button"
              onClick={() => { setRole("admin"); setError(""); }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                role === "admin"
                  ? "bg-amber-400 text-amber-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              วิทยากร / Admin
            </button>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 tracking-wide">
              อีเมล (Email address)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === "admin" ? "admin@police.go.th" : "officer@police.go.th"}
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-[#661D27]/25 focus:border-[#661D27]
                           focus:bg-white transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 tracking-wide">
                {role === "admin" ? "รหัสผ่านวิทยากร (Admin Code)" : "รหัสผ่าน (Password)"}
              </label>
            </div>
            <div className="relative">
              <Lock
                className={`w-4 h-4 absolute left-3.5 top-3.5 pointer-events-none ${
                  role === "admin" ? "text-amber-500" : "text-slate-400"
                }`}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={role === "admin" ? adminPassword : password}
                onChange={(e) =>
                  role === "admin"
                    ? setAdminPassword(e.target.value)
                    : setPassword(e.target.value)
                }
                placeholder={role === "admin" ? "กรอกรหัสแอดมิน" : "••••••••"}
                className={`w-full pl-10 pr-11 py-3 text-sm border rounded-xl
                           focus:outline-none focus:bg-white transition-all placeholder:text-slate-300 ${
                             role === "admin"
                               ? "bg-amber-50/60 border-amber-200 focus:ring-2 focus:ring-amber-400/25 focus:border-amber-400"
                               : "bg-slate-50 border-slate-200 focus:ring-2 focus:ring-[#661D27]/25 focus:border-[#661D27]"
                           }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 oxblood-gradient text-white rounded-xl font-semibold text-sm
                       shadow-lg shadow-red-950/20 hover:shadow-xl hover:shadow-red-950/25
                       hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>กำลังตรวจสอบ...</span>
              </>
            ) : (
              <>
                <span>เข้าสู่ระบบ</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </motion.form>

        {/* Register Link */}
        {role === "officer" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-xs text-slate-500 mt-6"
          >
            ยังไม่มีบัญชีผู้เข้าอบรม?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#661D27] hover:underline underline-offset-2"
            >
              ลงทะเบียนสมัครสมาชิก
            </Link>
          </motion.p>
        )}

        {/* Footer note */}
        <p className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-slate-300">
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
