"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone, Share, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// ---- iOS Safari mockup visual steps ----
const IOS_STEPS = [
  {
    step: 1,
    title: "เปิดใน Safari",
    desc: "ต้องเปิดด้วย Safari เท่านั้น (ไม่ใช่ Chrome หรือ Line)",
    visual: (
      <div className="relative w-full rounded-xl overflow-hidden bg-white/5 border border-white/10 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-red-400/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
          <div className="w-3 h-3 rounded-full bg-green-400/60" />
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
          <div className="w-3 h-3 rounded-full bg-green-400/80 flex-shrink-0" />
          <span className="text-white/60 text-xs truncate">ai-police.vercel.app</span>
        </div>
        {/* Safari logo indicator */}
        <div className="absolute top-3 right-3 text-blue-300 text-xs font-bold">Safari</div>
      </div>
    ),
  },
  {
    step: 2,
    title: 'แตะปุ่ม "แชร์" ⬆️',
    desc: "แตะปุ่มกล่องมีลูกศรชี้ขึ้น ที่แถบล่างตรงกลาง",
    visual: (
      <div className="relative w-full rounded-xl overflow-hidden bg-white/5 border border-white/10">
        {/* Fake browser bar */}
        <div className="bg-white/10 px-3 py-2 flex items-center gap-2">
          <div className="flex-1 bg-white/10 rounded-lg px-3 py-1 text-xs text-white/50 truncate">
            ai-police.vercel.app
          </div>
        </div>
        {/* Fake content area */}
        <div className="h-16 flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl overflow-hidden" style={{ boxShadow: "0 0 10px rgba(212,175,55,0.4)" }}>
            <img src="/icon-512x512.jpg" alt="AI POLICE" className="w-full h-full object-cover" />
          </div>
        </div>
        {/* Fake Safari bottom bar with HIGHLIGHTED share button */}
        <div className="bg-white/10 px-4 py-2 flex items-center justify-around">
          <span className="text-white/30 text-xs">◁</span>
          <span className="text-white/30 text-xs">▷</span>
          {/* HIGHLIGHTED share button with pulse */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: "rgba(212,175,55,0.4)" }}
            />
            <div
              className="relative w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(212,175,55,0.3)", border: "1.5px solid #d4af37" }}
            >
              <Share size={14} style={{ color: "#d4af37" }} />
            </div>
          </div>
          <span className="text-white/30 text-xs">⊡</span>
          <span className="text-white/30 text-xs">☰</span>
        </div>
        {/* Arrow annotation */}
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ color: "#d4af37", background: "rgba(15,23,42,0.9)", border: "1px solid #d4af37" }}
        >
          กดตรงนี้!
        </div>
      </div>
    ),
  },
  {
    step: 3,
    title: 'เลือก "เพิ่มในหน้าจอหลัก"',
    desc: "เลื่อนรายการลงมา แล้วแตะที่ไอคอน + เพิ่มในหน้าจอหลัก",
    visual: (
      <div className="w-full rounded-xl overflow-hidden bg-white/5 border border-white/10">
        {/* Fake share sheet */}
        <div className="bg-white/5 px-4 py-2 border-b border-white/10">
          <p className="text-white/40 text-xs text-center">แชร์</p>
        </div>
        <div className="flex gap-3 p-3 overflow-x-auto pb-2">
          {["ข้อความ", "เมล", "Airdrop", "หมายเหตุ"].map((item) => (
            <div key={item} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-white/10" />
              <span className="text-white/30 text-xs">{item}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10">
          {/* HIGHLIGHTED row */}
          <div
            className="flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-xl"
            style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.5)" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(212,175,55,0.2)", border: "1px solid #d4af37" }}
            >
              <Plus size={16} style={{ color: "#d4af37" }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: "#d4af37" }}>
              เพิ่มในหน้าจอหลัก
            </span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 opacity-30">
            <div className="w-8 h-8 rounded-full bg-white/10" />
            <span className="text-white/60 text-sm">คัดลอกลิงค์</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 4,
    title: 'กด "เพิ่ม" มุมบนขวา',
    desc: "ตรวจสอบชื่อแอป แล้วกด เพิ่ม ที่มุมบนขวามือ",
    visual: (
      <div className="w-full rounded-xl overflow-hidden bg-white/5 border border-white/10">
        <div className="bg-white/5 px-4 py-2.5 flex items-center justify-between border-b border-white/10">
          <span className="text-blue-300 text-sm">ยกเลิก</span>
          <span className="text-white/60 text-sm font-medium">เพิ่มในหน้าจอหลัก</span>
          {/* HIGHLIGHTED เพิ่ม button */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded animate-pulse"
              style={{ background: "rgba(212,175,55,0.3)" }}
            />
            <span className="relative font-bold text-sm" style={{ color: "#d4af37" }}>
              เพิ่ม
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0" style={{ boxShadow: "0 0 12px rgba(212,175,55,0.3)" }}>
            <img src="/icon-512x512.jpg" alt="AI POLICE" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">AI POLICE</p>
            <p className="text-white/40 text-xs">ai-police.vercel.app</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 5,
    title: "เสร็จแล้ว! 🎉",
    desc: "ไอคอน AI POLICE จะปรากฏบนหน้าจอหลักทันที แตะเพื่อเข้าใช้งานได้เลย",
    visual: (
      <div className="w-full rounded-xl overflow-hidden bg-white/5 border border-white/10 p-4">
        <div className="grid grid-cols-4 gap-3">
          {["Photos", "Maps", "Safari", ""].map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-12 h-12 rounded-2xl ${label ? "bg-white/10" : ""}`}>
                {!label && (
                  <div className="relative w-12 h-12">
                    <div
                      className="absolute inset-0 rounded-2xl animate-pulse"
                      style={{ background: "rgba(212,175,55,0.3)" }}
                    />
                    <img
                      src="/icon-512x512.jpg"
                      alt="AI POLICE"
                      className="w-full h-full object-cover rounded-2xl"
                      style={{ border: "2px solid #d4af37" }}
                    />
                  </div>
                )}
              </div>
              <span className="text-white/40 text-xs">{label || "AI POLICE"}</span>
            </div>
          ))}
        </div>
        <div
          className="mt-3 text-center text-xs py-1.5 rounded-lg font-medium"
          style={{ background: "rgba(212,175,55,0.15)", color: "#d4af37" }}
        >
          ✅ ติดตั้งสำเร็จแล้ว!
        </div>
      </div>
    ),
  },
];

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const ios =
      /iphone|ipad|ipod/i.test(ua) &&
      !(window as unknown as { MSStream: unknown }).MSStream;
    setIsIOS(ios);

    // Show banner after 3 seconds on iOS
    if (ios) {
      const timer = setTimeout(() => {
        const dismissed = localStorage.getItem("pwa-ios-dismissed");
        if (!dismissed) setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Android/Desktop: listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // ✅ browser ส่ง event มาใหม่ = พร้อมติดตั้งอีกครั้ง
      localStorage.removeItem("pwa-dismissed");
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setCurrentStep(0);
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setShowBanner(false);
      localStorage.removeItem("pwa-dismissed");
      localStorage.removeItem("pwa-ios-dismissed");
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(isIOS ? "pwa-ios-dismissed" : "pwa-dismissed", "1");
  };

  if (isInstalled || (!showBanner && !deferredPrompt)) return null;

  return (
    <>
      {/* ---- Install Banner ---- */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
          <div
            className="relative rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
              border: "1px solid rgba(212, 175, 55, 0.4)",
            }}
          >
            <div
              style={{
                height: "3px",
                background:
                  "linear-gradient(90deg, transparent, #d4af37, transparent)",
              }}
            />
            <div className="p-4">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
                aria-label="ปิด"
              >
                <X size={18} />
              </button>

              <div className="flex items-start gap-3 pr-6">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden"
                  style={{ boxShadow: "0 0 12px rgba(212,175,55,0.4)" }}
                >
                  <img
                    src="/icon-512x512.jpg"
                    alt="AI POLICE"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: "#d4af37" }}>
                    ติดตั้งแอป AI POLICE
                  </p>
                  <p className="text-white/70 text-xs mt-0.5 leading-relaxed">
                    {isIOS
                      ? "เพิ่มลงหน้าจอหลักใน 3 ขั้นตอน มีคู่มือภาพให้"
                      : "ติดตั้งลงมือถือ เข้าถึงระบบได้เหมือนแอปจริง"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2 px-3 rounded-xl text-xs text-white/60 border border-white/10 hover:border-white/20 transition-all"
                >
                  ไว้ทีหลัง
                </button>
                <button
                  id="pwa-install-btn"
                  onClick={handleInstall}
                  className="flex-[2] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, #d4af37, #f5d060, #d4af37)",
                    color: "#0f172a",
                    boxShadow: "0 4px 15px rgba(212,175,55,0.4)",
                  }}
                >
                  {isIOS ? (
                    <>
                      <Smartphone size={14} />
                      ดูวิธีติดตั้ง
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      ติดตั้งเลย
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- iOS Visual Step-by-Step Guide ---- */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl overflow-hidden"
            style={{
              background: "linear-gradient(170deg, #0f172a 0%, #1a2d4a 100%)",
              border: "1px solid rgba(212,175,55,0.4)",
              borderBottom: "none",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gold top border */}
            <div
              style={{
                height: "3px",
                background:
                  "linear-gradient(90deg, transparent, #d4af37, transparent)",
              }}
            />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <div>
                <h3 className="font-bold text-base" style={{ color: "#d4af37" }}>
                  📱 ติดตั้งบน iPhone/iPad
                </h3>
                <p className="text-white/40 text-xs mt-0.5">
                  ขั้นตอนที่ {currentStep + 1} / {IOS_STEPS.length}
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-white/40 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-5 mb-4">
              <div className="flex gap-1">
                {IOS_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full transition-all duration-300"
                    style={{
                      background:
                        i <= currentStep
                          ? "linear-gradient(90deg, #d4af37, #f5d060)"
                          : "rgba(255,255,255,0.1)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="px-5 overflow-y-auto" style={{ maxHeight: "55vh" }}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #d4af37, #f5d060)",
                    color: "#0f172a",
                  }}
                >
                  {IOS_STEPS[currentStep].step}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">
                    {IOS_STEPS[currentStep].title}
                  </p>
                  <p className="text-white/60 text-xs leading-relaxed">
                    {IOS_STEPS[currentStep].desc}
                  </p>
                </div>
              </div>

              {/* Visual mockup */}
              <div className="mb-5">{IOS_STEPS[currentStep].visual}</div>
            </div>

            {/* Navigation buttons */}
            <div className="px-5 pb-6 pt-2 flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="flex-1 py-3 rounded-2xl text-sm border border-white/10 text-white/60 hover:border-white/20 transition-all"
                >
                  ← ก่อนหน้า
                </button>
              )}
              {currentStep < IOS_STEPS.length - 1 ? (
                <button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="flex-[2] py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #d4af37, #f5d060)",
                    color: "#0f172a",
                    boxShadow: "0 4px 15px rgba(212,175,55,0.35)",
                  }}
                >
                  ถัดไป →
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowIOSGuide(false);
                    setShowBanner(false);
                    localStorage.setItem("pwa-ios-dismissed", "1");
                  }}
                  className="flex-[2] py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #d4af37, #f5d060)",
                    color: "#0f172a",
                    boxShadow: "0 4px 15px rgba(212,175,55,0.35)",
                  }}
                >
                  ✅ เสร็จแล้ว!
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
