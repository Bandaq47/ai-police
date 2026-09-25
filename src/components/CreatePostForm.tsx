"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X, Send, Loader2, PenSquare, Sparkles } from "lucide-react";

interface CreatePostFormProps {
  onPostCreated?: () => void;
  className?: string;
}

export default function CreatePostForm({ onPostCreated, className = "" }: CreatePostFormProps) {
  const { user, addPost } = useAuth();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const displayName = `${user.rank ? user.rank + " " : ""}${user.full_name}`;
  const authorInitial = user.full_name?.charAt(0) || "ต";

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 5 MB");
      return;
    }

    setImageFile(file);
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() && !imageFile) {
      setError("กรุณาพิมพ์ข้อความหรือแนบรูปภาพ");
      return;
    }

    setLoading(true);
    setError("");

    const res = await addPost(content.trim(), imageFile || undefined);
    if (res.success) {
      setContent("");
      handleRemoveImage();
      onPostCreated?.();
    } else {
      setError(res.errorMessage || "เกิดข้อผิดพลาดในการโพสต์ กรุณาลองใหม่อีกครั้ง");
    }

    setLoading(false);
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-5 space-y-3.5 transition-all ${className}`}
    >
      {/* ── Widget Header ── */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#661D27]/10 text-[#661D27] flex items-center justify-center">
            <PenSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">สร้างโพสต์ใหม่</h3>
            <p className="text-[11px] text-slate-400">แบ่งปันกับเพื่อนตำรวจ</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
          <Sparkles className="w-3 h-3" />
          <span>AI Community</span>
        </div>
      </div>

      {/* ── User Profile Snapshot ── */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7a2130] to-[#4A141B] flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
          {authorInitial}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
          <p className="text-[11px] text-slate-500 truncate">{user.unit}</p>
        </div>
      </div>

      {/* ── Compact Text Area ── */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`วันนี้คุณมีเทคนิค AI อะไรอยากบอกเพื่อนตำรวจบ้าง?...`}
          rows={3}
          className="w-full resize-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 
                     bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80
                     focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#661D27]/20 focus:border-[#661D27]/40
                     transition-all"
        />
      </div>

      {/* ── Image Preview Thumbnail (Compact) ── */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 group"
          >
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white 
                         rounded-full p-1.5 shadow-md transition-all"
              title="ลบรูปภาพ"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md">
              แนบแล้ว
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error Banner ── */}
      {error && (
        <p className="text-red-500 text-xs font-medium px-1 bg-red-50 py-1 rounded-lg">
          {error}
        </p>
      )}

      {/* ── Action Bar (Compact) ── */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
        {/* Attach Image Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium
                     text-slate-600 hover:text-[#661D27] hover:bg-slate-100/80 transition-all cursor-pointer"
        >
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          <span>{imageFile ? "เปลี่ยนรูป" : "แนบภาพ"}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Submit Post Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={loading || (!content.trim() && !imageFile)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                     bg-gradient-to-r from-[#7a2130] to-[#661D27] text-white hover:from-[#661D27] hover:to-[#4A141B] 
                     disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>กำลังโพสต์...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>โพสต์</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
