"use client";

import React, { useState } from "react";
import { NewsItem } from "@/lib/constants";
import {
  extractYouTubeUrl,
  getYouTubeThumbnailUrl,
  formatThaiShortDate,
  getViewsCount,
  cleanBodyText,
} from "@/lib/youtube-utils";
import { Calendar, Eye, Share2, Play, AlertTriangle, Check } from "lucide-react";
import { motion } from "framer-motion";

interface NewsCardProps {
  item: NewsItem;
  onClick?: (item: NewsItem) => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export default function NewsCard({
  item,
  onClick,
  selectable = false,
  selected = false,
  onToggleSelect,
}: NewsCardProps) {
  const [copied, setCopied] = useState(false);
  const ytUrl = extractYouTubeUrl(item);
  const thumbnailUrl = ytUrl ? getYouTubeThumbnailUrl(ytUrl) : null;
  const views = getViewsCount(item.id);
  const dateStr = formatThaiShortDate(item.created_at);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = ytUrl || item.url || (typeof window !== "undefined" ? window.location.href : "");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (selectable) {
      // In admin selectable mode: clicking the card toggles the checkbox
      if (onToggleSelect) {
        onToggleSelect(item.id);
      }
    } else {
      // In regular mode: clicking opens video / details modal
      if (onClick) {
        onClick(item);
      }
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Clicking the play button always opens the video modal
    if (onClick) {
      onClick(item);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelect) {
      onToggleSelect(item.id);
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick(e as any);
        }
      }}
      className={`group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-[#1a080c] shadow-lg cursor-pointer transition-all select-none ${
        selected
          ? "border-2 border-red-500 shadow-red-950/80 shadow-2xl ring-4 ring-red-500/30"
          : "border border-[#4a151e] hover:border-[#8b1e2c] hover:shadow-red-950/50 hover:shadow-2xl"
      }`}
      style={{ minHeight: "230px" }}
    >
      {/* ── Top-left & Bottom-right Cyber Accent Markers ── */}
      <div className="absolute top-0 left-0 w-8 h-1 bg-[#821c2a] z-20 rounded-br-sm" />
      <div className="absolute top-0 left-0 w-1 h-8 bg-[#821c2a] z-20 rounded-br-sm" />
      <div className="absolute bottom-0 right-0 w-8 h-1 bg-[#821c2a] z-20 rounded-tl-sm" />
      <div className="absolute bottom-0 right-0 w-1 h-8 bg-[#821c2a] z-20 rounded-tl-sm" />

      {/* ── Background Thumbnail / Cyber Background ── */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#120508]">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={item.title}
            className={`w-full h-full object-cover object-center transition-transform duration-500 ${
              selected ? "opacity-95 scale-105" : "opacity-85 group-hover:scale-105"
            }`}
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#2a0b12] via-[#1a080c] to-[#0c0406] flex items-center justify-center p-6">
            <div className="w-24 h-24 rounded-full bg-[#661D27]/20 border border-[#661D27]/40 flex items-center justify-center text-[#d9777f]">
              <span className="text-3xl font-extrabold tracking-widest opacity-40">AI POLICE</span>
            </div>
          </div>
        )}

        {/* Dark Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 z-10" />
        <div className={`absolute inset-0 z-10 ${selected ? "bg-red-950/30" : "bg-[#3b0d15]/20"} mix-blend-multiply`} />
      </div>

      {/* ── Top Badges & Selection Checkbox ── */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
        <div>
          {item.urgent ? (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded-full shadow-md animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              ประกาศด่วน
            </span>
          ) : (
            <span className="px-2.5 py-0.5 bg-black/60 backdrop-blur-md text-white/90 border border-white/10 text-[10px] font-medium rounded-full">
              {ytUrl ? "วิดีโอแนะนำ" : "ข่าวสาร"}
            </span>
          )}
        </div>

        {/* Prominent Checkbox for Admin selection */}
        {selectable && (
          <button
            type="button"
            onClick={handleCheckboxClick}
            className={`pointer-events-auto w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90 ${
              selected
                ? "bg-red-600 text-white scale-110 border-2 border-white ring-2 ring-red-500"
                : "bg-black/70 backdrop-blur-md border-2 border-white/70 hover:border-white hover:bg-black/90 text-transparent"
            }`}
            title={selected ? "คลิกเพื่อยกเลิกการเลือก" : "คลิกเพื่อเลือกรายการนี้สำหรับลบ"}
          >
            <Check className={`w-5 h-5 stroke-[3] ${selected ? "text-white" : "opacity-0"}`} />
          </button>
        )}
      </div>

      {/* ── Center YouTube Play Button ── */}
      {ytUrl && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <button
            type="button"
            onClick={handlePlayClick}
            className="relative flex items-center justify-center w-14 h-10 sm:w-16 sm:h-11 rounded-2xl bg-[#731520]/90 border border-[#b83344]/60 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-115 hover:bg-[#961c2b] hover:shadow-red-600/50 cursor-pointer"
            title="คลิกเพื่อเล่นวิดีโอ"
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-0.5" />
          </button>
        </div>
      )}

      {/* ── Bottom Content Info ── */}
      <div className="relative z-20 p-4 pt-12 flex flex-col justify-end space-y-2">
        {/* Title */}
        <h3 className="text-white font-bold text-sm sm:text-base leading-snug line-clamp-2 drop-shadow-md group-hover:text-amber-300 transition-colors">
          {item.title}
        </h3>

        {/* Optional body preview if short */}
        {!ytUrl && item.body && (
          <p className="text-white/70 text-xs line-clamp-2 leading-relaxed">
            {cleanBodyText(item.body) || item.body}
          </p>
        )}

        {/* Bottom Meta Row (Date, Views, Share) */}
        <div className="flex items-center justify-between text-[11px] text-white/80 pt-2 border-t border-white/10">
          <div className="flex items-center gap-3">
            {/* Date */}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-white/70" />
              <span>{dateStr}</span>
            </span>

            {/* Views */}
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-white/70" />
              <span>{views}</span>
            </span>
          </div>

          {/* Share / Link Button */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-md hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="คัดลอกลิงก์"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            {copied && (
              <span className="text-[10px] text-emerald-400 font-medium">
                คัดลอกแล้ว
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
