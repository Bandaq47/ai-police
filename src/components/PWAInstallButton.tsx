"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

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
        // iOS ไม่มี beforeinstallprompt → ตรวจ standalone แทน
        // ถ้าไม่ได้รันเป็นแอป = ยังไม่ติดตั้ง → แสดงปุ่มได้
        const dismissed = localStorage.getItem("pwa-ios-dismissed");
        if (!dismissed) setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Android/Desktop: listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // ✅ browser ส่ง event มาใหม่ = พร้อมติดตั้งอีกครั้ง (เช่น ลบแอปแล้วกลับมา)
      // → ล้าง dismiss flag ทิ้งเสมอ เพื่อให้ปุ่มโผล่อีกรอบ
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
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setShowBanner(false);
      // ✅ ติดตั้งสำเร็จ → ล้าง flag ทั้งหมด
      // เพื่อให้ครั้งต่อไปที่ลบแอปแล้วกลับมา ปุ่มจะโผล่อีกครั้ง
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
      {/* Install Banner */}
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
            {/* Gold shimmer top border */}
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
                {/* Icon */}
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden"
                  style={{
                    boxShadow: "0 0 12px rgba(212,175,55,0.4)",
                  }}
                >
                  <img
                    src="/icon-512x512.jpg"
                    alt="AI POLICE"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold text-sm"
                    style={{ color: "#d4af37" }}
                  >
                    ติดตั้งแอป AI POLICE
                  </p>
                  <p className="text-white/70 text-xs mt-0.5 leading-relaxed">
                    {isIOS
                      ? "เพิ่มลงหน้าจอหลักเพื่อใช้งานเหมือนแอปจริง"
                      : "ติดตั้งลงมือถือเพื่อเข้าถึงระบบได้ทันที"}
                  </p>
                </div>
              </div>

              {/* Buttons */}
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
                      วิธีติดตั้ง
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

      {/* iOS Step-by-step Guide Modal */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0f172a, #1e3a5f)",
              border: "1px solid rgba(212,175,55,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                height: "3px",
                background:
                  "linear-gradient(90deg, transparent, #d4af37, transparent)",
              }}
            />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="font-bold text-base"
                  style={{ color: "#d4af37" }}
                >
                  📱 วิธีติดตั้งบน iPhone/iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-white/50 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    step: "1",
                    text: 'แตะปุ่ม "แชร์" (กล่องมีลูกศรขึ้น) ที่ด้านล่างของ Safari',
                  },
                  {
                    step: "2",
                    text: 'เลื่อนลงและเลือก "เพิ่มในหน้าจอหลัก"',
                  },
                  { step: "3", text: 'กด "เพิ่ม" ที่มุมบนขวา' },
                  { step: "4", text: "แอป AI POLICE จะปรากฏบนหน้าจอหลักทันที!" },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background:
                          "linear-gradient(135deg, #d4af37, #f5d060)",
                        color: "#0f172a",
                      }}
                    >
                      {step}
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed pt-0.5">
                      {text}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-3 rounded-xl font-bold text-sm"
                style={{
                  background: "linear-gradient(135deg, #d4af37, #f5d060)",
                  color: "#0f172a",
                }}
              >
                เข้าใจแล้ว!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
