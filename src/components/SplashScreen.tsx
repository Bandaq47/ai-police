"use client";

import React, { useEffect, useState } from "react";
import { Shield, Sparkles, CheckCircle2, Lock, ArrowRight, Laptop, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete?: () => void;
  statusMessage?: string;
  autoRedirect?: boolean;
}

const LOADING_STEPS = [
  { progress: 28, text: "กำลังเตรียมความพร้อมของระบบ..." },
  { progress: 62, text: "ตรวจสอบความปลอดภัยและสิทธิ์การเข้าใช้งาน..." },
  { progress: 88, text: "เชื่อมต่อฐานข้อมูลตำรวจภูธรจังหวัดสุราษฎร์ธานี..." },
  { progress: 100, text: "เข้าสู่ระบบสำเร็จ กำลังนำท่านไปยังหน้าหลัก..." },
];

export default function SplashScreen({
  onComplete,
  statusMessage,
  autoRedirect = true,
}: SplashScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [showManualSkip, setShowManualSkip] = useState(false);

  useEffect(() => {
    // Stage 1
    const t1 = setTimeout(() => {
      setStepIndex(1);
      setProgress(55);
    }, 450);

    // Stage 2
    const t2 = setTimeout(() => {
      setStepIndex(2);
      setProgress(85);
    }, 950);

    // Stage 3
    const t3 = setTimeout(() => {
      setStepIndex(3);
      setProgress(100);
    }, 1500);

    // Complete transition
    const t4 = setTimeout(() => {
      if (autoRedirect && onComplete) {
        onComplete();
      }
    }, 1900);

    // Safety fallback: If still on splash screen after 3.5s, display manual proceed button
    const t5 = setTimeout(() => {
      setShowManualSkip(true);
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [autoRedirect, onComplete]);

  const currentStep = LOADING_STEPS[stepIndex];

  return (
    <div
      className="splash-container flex flex-col justify-between items-center w-full select-none text-white relative overflow-hidden"
      style={{
        minHeight: "100vh",
        height: "100dvh",
        paddingTop: "max(1.25rem, env(safe-area-inset-top, 0px))",
        paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
        paddingLeft: "max(1.25rem, env(safe-area-inset-left, 0px))",
        paddingRight: "max(1.25rem, env(safe-area-inset-right, 0px))",
      }}
    >
      {/* ── Ambient Background Lighting (Adaptive Light/Dark Glows) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-center radial warm pulse */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] rounded-full bg-amber-400/15 dark:bg-red-600/15 blur-[110px] animate-aura-pulse" />
        {/* Bottom soft glow */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full bg-black/40 blur-[90px]" />
        
        {/* Subtle Cyber Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      {/* ── TOP: Header / Security Status Bar ── */}
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl flex items-center justify-between z-10 pt-2 px-2"
      >
        {/* Gov badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 dark:bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 dark:border-white/10 shadow-sm">
          <Shield className="w-4 h-4 text-amber-300 dark:text-amber-400" />
          <span className="text-xs font-semibold tracking-wide text-white/95">
            ภ.จว.สุราษฎร์ธานี • POLICE REGION 8
          </span>
        </div>

        {/* Security & SSL indicator */}
        <div className="hidden sm:inline-flex items-center gap-2 bg-white/10 dark:bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 dark:border-white/10 text-xs font-medium text-white/80">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>ระบบรักษาความปลอดภัยระดับรัฐ</span>
        </div>
      </motion.header>

      {/* ── CENTER: Hero Emblem, Branding & Progress Bar ── */}
      <main className="flex-1 w-full max-w-md md:max-w-lg flex flex-col items-center justify-center text-center px-4 z-10 py-6 my-auto">
        {/* Shield Icon with Radar Sweep & Breathing Rings */}
        <motion.div
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="relative mb-7 flex items-center justify-center"
        >
          {/* Outer Breathing Ring */}
          <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-amber-300/30 dark:border-red-500/30 animate-aura-pulse pointer-events-none" />

          {/* Radar Sweep Ring */}
          <div className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-dashed border-white/20 dark:border-white/10 animate-radar-sweep pointer-events-none" />

          {/* Inner Glowing Badge Glass Container */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-white/20 via-white/10 to-black/30 dark:from-white/10 dark:via-black/40 dark:to-black/80 backdrop-blur-xl border border-white/30 dark:border-white/20 shadow-2xl flex items-center justify-center p-3">
            {/* Center Royal Police Shield */}
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#8a2433] to-[#450e15] dark:from-[#5c131d] dark:to-[#220508] border border-amber-400/40 flex items-center justify-center shadow-inner relative overflow-hidden">
              {/* Highlight glimmer */}
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/25 rounded-full blur-md" />
              <Shield className="w-12 h-12 sm:w-14 sm:h-14 text-amber-300 drop-shadow-[0_2px_12px_rgba(252,211,77,0.5)]" />
              <Sparkles className="w-5 h-5 text-white absolute top-2 right-2 animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* Title & Organization Name */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-2 mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 text-xs font-bold tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            AI Intelligence Platform
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
            AI POLICE
          </h1>

          <p className="text-base sm:text-lg text-white/95 font-semibold leading-tight">
            ตำรวจภูธรจังหวัดสุราษฎร์ธานี
          </p>

          <p className="text-xs sm:text-sm text-white/70 max-w-sm mx-auto leading-relaxed pt-1">
            ระบบฝึกอบรมและส่งผลงานการประยุกต์ใช้ปัญญาประดิษฐ์เพื่อพัฒนาประสิทธิภาพงานตำรวจ
          </p>
        </motion.div>

        {/* ── High-Tech Progress Bar ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="w-full space-y-3.5"
        >
          {/* Progress Track */}
          <div className="relative w-full h-2.5 sm:h-3 rounded-full bg-black/40 dark:bg-black/60 border border-white/20 dark:border-white/10 p-0.5 overflow-hidden shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-rose-400 shadow-[0_0_12px_rgba(251,191,36,0.7)]"
              initial={{ width: "15%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </div>

          {/* Dynamic Status Ticker */}
          <div className="flex items-center justify-between text-xs sm:text-sm px-1 min-h-[1.75rem]">
            <AnimatePresence mode="wait">
              <motion.span
                key={stepIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="text-white/85 font-medium flex items-center gap-2 truncate text-left"
              >
                {progress === 100 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                )}
                <span>{statusMessage || currentStep.text}</span>
              </motion.span>
            </AnimatePresence>

            <span className="font-mono font-bold text-amber-300 ml-3 shrink-0 tabular-nums">
              {progress}%
            </span>
          </div>

          {/* Fallback Manual Proceed Button (if slow device/connection) */}
          {showManualSkip && onComplete && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onComplete}
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm border border-white/30 backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>กดที่นี่เพื่อเข้าสู่ระบบทันที</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </motion.div>
      </main>

      {/* ── BOTTOM: Platform Support, Notch Safe-Area & Version ── */}
      <motion.footer
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white/60 text-xs px-3 pb-1 z-10"
      >
        {/* Cross-platform badge */}
        <div className="flex items-center gap-2 bg-white/10 dark:bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <div className="flex items-center gap-1 text-white/80">
            <Smartphone className="w-3.5 h-3.5" />
            <Laptop className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] text-white/80 whitespace-nowrap">
            รองรับ iOS • Android • Windows • macOS
          </span>
        </div>

        {/* Version tag */}
        <div className="flex items-center gap-3 text-[11px] text-white/70 whitespace-nowrap">
          <span>AI POLICE v1.2.0 (2026)</span>
          <span>•</span>
          <span>19 สถานีตำรวจภูธรในสังกัด</span>
        </div>
      </motion.footer>
    </div>
  );
}
