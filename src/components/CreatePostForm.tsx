"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X, Send, Loader2 } from "lucide-react";

interface CreatePostFormProps {
  onPostCreated?: () => void;
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const { user, addPost } = useAuth();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) {
      setError("กรุณาเขียนข้อความหรือแนบรูปภาพ");
      return;
    }

    setLoading(true);
    setError("");

    const ok = await addPost(content.trim(), imageFile || undefined);
    if (ok) {
      setContent("");
      handleRemoveImage();
      onPostCreated?.();
    } else {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }

    setLoading(false);
  };

  if (!user) return null;

  const displayName = `${user.rank ? user.rank + " " : ""}${user.full_name}`;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7a2130] to-[#4A141B] flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">
            {user.full_name?.charAt(0) || "?"}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{displayName}</p>
          <p className="text-xs text-slate-500">{user.unit}</p>
        </div>
      </div>

      {/* Text Area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`${user.full_name} อยากแชร์อะไร?`}
        rows={3}
        className="w-full resize-none text-slate-800 text-sm placeholder:text-slate-400
                   bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200 
                   focus:outline-none focus:ring-2 focus:ring-[#661D27]/20 focus:border-[#661D27]/40
                   transition-all"
      />

      {/* Image Preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden border border-slate-200"
          >
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-h-64 object-cover"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white 
                         rounded-full p-1.5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs font-medium px-1">{error}</p>
      )}

      {/* Bottom bar */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                     text-slate-600 hover:bg-slate-100 hover:text-[#661D27] transition-all"
        >
          <ImageIcon className="w-4 h-4" />
          แนบรูปภาพ
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <button
          onClick={handleSubmit}
          disabled={loading || (!content.trim() && !imageFile)}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold
                     bg-[#661D27] text-white hover:bg-[#4A141B] disabled:opacity-40 
                     disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> กำลังโพสต์...</>
          ) : (
            <><Send className="w-4 h-4" /> โพสต์</>
          )}
        </button>
      </div>
    </div>
  );
}
