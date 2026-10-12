"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  X,
  Send,
  Loader2,
  PenSquare,
  Sparkles,
  Plus,
  Trash2
} from "lucide-react";

interface CreatePostFormProps {
  onPostCreated?: () => void;
  className?: string;
}

export default function CreatePostForm({ onPostCreated, className = "" }: CreatePostFormProps) {
  const { user, addPost } = useAuth();
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const displayName = `${user.rank ? user.rank + " " : ""}${user.full_name}`;
  const authorInitial = user.full_name?.charAt(0) || "ต";

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit maximum total images
    const MAX_IMAGES = 10;
    const remainingSlots = MAX_IMAGES - imageFiles.length;

    if (remainingSlots <= 0) {
      setError(`คุณสามารถแนบรูปภาพได้สูงสุด ${MAX_IMAGES} รูปต่อโพสต์`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setError(`แนบได้สูงสุด ${MAX_IMAGES} รูป (คัดเลือก ${remainingSlots} รูปแรก)`);
    } else {
      setError("");
    }

    // Validate size (5MB per file)
    const validFiles: File[] = [];
    for (const f of filesToAdd) {
      if (f.size > 5 * 1024 * 1024) {
        setError(`ไฟล์ "${f.name}" มีขนาดเกิน 5 MB กรุณาเลือกรูปภาพขนาดเล็กลง`);
      } else {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Read previews
    const newPreviews: string[] = [];
    let loadedCount = 0;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          newPreviews.push(ev.target.result as string);
        }
        loadedCount++;
        if (loadedCount === validFiles.length) {
          setImageFiles((prev) => [...prev, ...validFiles]);
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveOneImage = (indexToRemove: number) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClearAllImages = () => {
    setImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() && imageFiles.length === 0) {
      setError("กรุณาพิมพ์ข้อความหรือแนบรูปภาพอย่างน้อย 1 รูป");
      return;
    }

    setLoading(true);
    setError("");

    const res = await addPost(content.trim(), imageFiles);
    if (res.success) {
      setContent("");
      handleClearAllImages();
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
          <div className="w-8 h-8 rounded-xl bg-[#661D27]/10 text-[#661D27] flex items-center justify-center">
            <PenSquare className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">สร้างโพสต์ใหม่</h3>
            <p className="text-xs text-slate-500">แบ่งปันกับเพื่อนตำรวจ</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Community</span>
        </div>
      </div>

      {/* ── User Profile Snapshot ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7a2130] to-[#4A141B] flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
          {authorInitial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
          <p className="text-xs text-slate-500 truncate">{user.unit}</p>
        </div>
      </div>

      {/* ── Compact Text Area ── */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="วันนี้คุณมีเทคนิค AI อะไรอยากบอกเพื่อนตำรวจบ้าง?..."
          rows={3}
          className="w-full resize-none text-base text-slate-800 placeholder:text-slate-400 
                     bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80
                     focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#661D27]/20 focus:border-[#661D27]/40
                     transition-all leading-relaxed"
        />
      </div>

      {/* ── Facebook-Style Multi-Image Preview Container ── */}
      <AnimatePresence>
        {imagePreviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 space-y-2.5"
          >
            {/* Header: Photo Count & Clear button */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                รูปภาพที่แนบ ({imagePreviews.length}/10 รูป)
              </span>
              <button
                type="button"
                onClick={handleClearAllImages}
                className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                ล้างทั้งหมด
              </button>
            </div>

            {/* Preview Grid */}
            <div
              className={`grid gap-2 ${
                imagePreviews.length === 1
                  ? "grid-cols-1"
                  : imagePreviews.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
              }`}
            >
              {imagePreviews.map((previewUrl, index) => (
                <div
                  key={index}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video sm:aspect-square"
                >
                  <img
                    src={previewUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Remove specific image */}
                  <button
                    type="button"
                    onClick={() => handleRemoveOneImage(index)}
                    className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-red-600 text-white 
                               rounded-full p-1 shadow-md transition-colors"
                    title="ลบรูปนี้"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Photo index badge */}
                  <span className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {index + 1}
                  </span>
                </div>
              ))}

              {/* Add more photo slot if under 10 */}
              {imagePreviews.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#661D27] hover:bg-[#661D27]/5 
                             rounded-xl flex flex-col items-center justify-center p-3 text-slate-500 hover:text-[#661D27]
                             transition-all aspect-video sm:aspect-square group cursor-pointer"
                  title="เพิ่มรูปภาพอีก"
                >
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold mt-1">เพิ่มภาพ</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error Banner ── */}
      {error && (
        <p className="text-red-600 text-sm font-medium px-3 bg-red-50 py-2 rounded-xl">
          {error}
        </p>
      )}

      {/* ── Action Bar (Compact) ── */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
        {/* Attach Images Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold
                     text-slate-700 hover:text-[#661D27] hover:bg-slate-100 transition-all cursor-pointer whitespace-nowrap"
        >
          <ImageIcon className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>
            {imageFiles.length > 0 ? `แนบภาพเพิ่ม (${imageFiles.length})` : "แนบภาพ"}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesSelect}
          className="hidden"
        />

        {/* Submit Post Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={loading || (!content.trim() && imageFiles.length === 0)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                     bg-gradient-to-r from-[#7a2130] to-[#661D27] text-white hover:from-[#661D27] hover:to-[#4A141B] 
                     disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {imageFiles.length > 1
                  ? `กำลังอัปโหลด ${imageFiles.length} ภาพ...`
                  : "กำลังโพสต์..."}
              </span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>โพสต์</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
