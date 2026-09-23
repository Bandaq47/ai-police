"use client";

import React, { useEffect } from "react";
import { NewsItem } from "@/lib/constants";
import { getYouTubeEmbedUrl, formatThaiShortDate, extractYouTubeUrl, cleanBodyText } from "@/lib/youtube-utils";
import { X, Calendar, AlertTriangle, ExternalLink, Play } from "lucide-react";
import { YoutubeIcon } from "@/components/YoutubeIcon";
import { motion, AnimatePresence } from "framer-motion";

interface VideoModalProps {
  item: NewsItem | null;
  onClose: () => void;
}

export default function VideoModal({ item, onClose }: VideoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (item) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  const ytUrl = item ? extractYouTubeUrl(item) : null;
  const embedUrl = ytUrl ? getYouTubeEmbedUrl(ytUrl, true) : null;

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
          {/* Backdrop click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-3xl bg-[#140b0d] border border-[#4a151e] rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#200d11] border-b border-[#4a151e] shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-semibold text-white/90">
                  {ytUrl ? "วิดีโอข่าวสาร / การบรรยาย" : "ข่าวสารและประกาศ"}
                </span>
                {item.urgent && (
                  <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    ด่วน
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player or Fallback */}
            <div className="flex-1 overflow-y-auto">
              {embedUrl ? (
                <div className="relative w-full aspect-video bg-black">
                  <iframe
                    src={embedUrl}
                    title={item.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              ) : null}

              {/* Content Details */}
              <div className="p-5 sm:p-6 space-y-4 text-white">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold leading-snug text-white mb-2">
                    {item.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {formatThaiShortDate(item.created_at)}
                    </span>
                    <span>•</span>
                    <span>ตำรวจภูธรจังหวัดสุราษฎร์ธานี</span>
                  </div>
                </div>

                {item.body && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/80 text-sm leading-relaxed whitespace-pre-line">
                    {cleanBodyText(item.body) || item.body}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {ytUrl && (
                    <a
                      href={ytUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
                    >
                      <YoutubeIcon className="w-4 h-4 text-white" />
                      เปิดดูบน YouTube โดยตรง
                    </a>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors border border-white/15"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                      เปิดลิงก์เอกสารแนบ
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
