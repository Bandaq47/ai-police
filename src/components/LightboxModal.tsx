"use client";

import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LightboxModalProps {
  isOpen: boolean;
  imageUrl: string;
  title?: string;
  onClose: () => void;
}

export default function LightboxModal({ isOpen, imageUrl, title, onClose }: LightboxModalProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90 text-white">
            <h3 className="font-medium text-sm sm:text-base text-slate-200 line-clamp-1">
              {title || "ภาพแนบประกอบผลงาน"}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image Container */}
          <div className="p-4 flex items-center justify-center max-h-[80vh] overflow-auto">
            <img
              src={imageUrl}
              alt={title || "Enlarged submission image"}
              className="max-h-[75vh] w-auto object-contain rounded-lg shadow-md"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
