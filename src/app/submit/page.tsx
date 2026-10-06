"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { resizeImageIfNeeded } from "@/lib/image-utils";
import { createClient } from "@/lib/supabase/client";
import { Send, Upload, X, CheckCircle, Sparkles, Image as ImageIcon, FileText, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

function SubmitFormContent() {
  const { user, lessons, addSubmission } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [lessonId, setLessonId] = useState<string>("");
  const [promptText, setPromptText] = useState("");
  const [notes, setNotes] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const preselectedLesson = searchParams.get("lesson");
    if (preselectedLesson && lessons.some((l) => l.id === preselectedLesson)) {
      setLessonId(preselectedLesson);
    } else if (lessons.length > 0) {
      setLessonId(lessons[0].id);
    }
  }, [user, lessons, searchParams, router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      try {
        // Automatic client-side canvas resize before upload
        const resizedDataUrl = await resizeImageIfNeeded(file, 1000, 0.85);
        setImagePreview(resizedDataUrl);
      } catch (err) {
        console.error("Image processing error", err);
        setError("เกิดข้อผิดพลาดในการประมวลผลไฟล์ภาพ");
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!lessonId) {
      setError("กรุณาเลือกหัวข้อบทเรียน");
      return;
    }

    if (!promptText.trim()) {
      setError("กรุณากรอกพรอมต์ที่ฝึกเขียน");
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = "";
      
      // Upload image to Supabase Storage if exists
      if (imageFile && user) {
        const supabase = createClient();
        const fileExt = imageFile.name.split('.').pop() || 'png';
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('submissions')
          .upload(fileName, imageFile);
          
        if (uploadError) {
          throw new Error("อัปโหลดรูปภาพไม่สำเร็จ: " + uploadError.message);
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('submissions')
          .getPublicUrl(fileName);
          
        finalImageUrl = publicUrlData.publicUrl;
      }

      const isSuccess = await addSubmission({
        lesson_id: lessonId,
        prompt_text: promptText.trim(),
        notes: notes.trim(),
        image_url: finalImageUrl || imagePreview // fallback to preview if no final url
      });

      if (isSuccess) {
        setSuccess(true);
        // Trigger celebratory confetti micro-interaction
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        setTimeout(() => {
          router.push("/dashboard"); // Changed from /my-submissions since it wasn't setup
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการส่งงาน");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl w-full mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6"
    >
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Send className="w-7 h-7 text-[#661D27]" />
          แบบฟอร์มส่งงานฝึกเขียนพรอมต์
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          กรอกข้อมูลพรอมต์และแนบภาพผลลัพธ์ (ถ้ามี) ระบบจะบันทึกงานเพื่อส่งให้วิทยากรตรวจสอบ
        </p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3"
          >
            <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-emerald-900 text-xl">ส่งงานสำเร็จเรียบร้อย!</h3>
            <p className="text-sm text-emerald-700">กำลังนำท่านไปยังหน้าประวัติการส่งงาน...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              {error}
            </div>
          )}

          {/* 1. Mandatory Lesson Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-amber-500" />
              <span>หัวข้อบทเรียน</span>
              <span className="text-red-500 font-normal text-xs whitespace-nowrap">* (เลือกจากรายการที่กำหนดเท่านั้น)</span>
            </label>
            <select
              required
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="w-full px-4 py-3.5 text-base bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#661D27] focus:bg-white transition-all font-semibold text-slate-800"
            >
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Prompt Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-[#661D27]" />
              <span>พรอมต์ที่ฝึกเขียน (Prompt Text)</span>
              <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="กรอกพรอมต์ภาษาไทย หรือ ภาษาอังกฤษ ที่ท่านใช้สั่งการ AI..."
              className="w-full px-4 py-3.5 text-base bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#661D27] focus:bg-white transition-all leading-relaxed"
            />
          </div>

          {/* 3. Optional Notes Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
              <span>บันทึกเพิ่มเติม (Notes)</span>
              <span className="text-slate-500 font-normal text-xs whitespace-nowrap">(ไม่บังคับ)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ระบุเครื่องมือ AI ที่ใช้ (เช่น Midjourney v6, ChatGPT, Gamma) หรือหมายเหตุเพิ่มเติม..."
              className="w-full px-4 py-3.5 text-base bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#661D27] focus:bg-white transition-all"
            />
          </div>

          {/* 4. Optional Image Upload with Auto-Resize preview */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4.5 h-4.5 text-[#661D27]" />
                แนบภาพผลลัพธ์จาก AI หรือสื่อประกอบ
              </span>
              <span className="text-slate-500 font-normal text-xs whitespace-nowrap">(ระบบย่อขนาดอัตโนมัติ)</span>
            </label>

            {!imagePreview ? (
              <label className="border-2 border-dashed border-slate-200 hover:border-[#661D27] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-red-50/20 group">
                <Upload className="w-9 h-9 text-slate-400 group-hover:text-[#661D27] transition-colors mb-2" />
                <span className="text-sm font-semibold text-slate-700 group-hover:text-[#661D27]">
                  คลิกเพื่อเลือกไฟล์ภาพ หรือ ลากไฟล์มาวางที่นี่
                </span>
                <span className="text-xs text-slate-500 mt-1 whitespace-nowrap">รองรับ JPG, PNG, WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group max-h-72 flex justify-center items-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-72 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-colors shadow-md"
                  title="ลบภาพแนบ"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 oxblood-gradient text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2.5 group disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="whitespace-nowrap">กำลังบันทึกส่งงาน...</span>
            ) : (
              <>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <span className="whitespace-nowrap">ยืนยันส่งงานเข้าระบบ</span>
              </>
            )}
          </button>
        </form>
      )}
    </motion.div>
  );
}

export default function SubmitPage() {
  return (
    <div
      className="min-h-dvh bg-[#FAF8F8]"
      style={{ paddingTop: "calc(56px + env(safe-area-inset-top, 0px))" }}
    >
      <Navbar />
      <main
        className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6"
        style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
      >
        <Suspense fallback={<div className="text-center py-10">กำลังโหลด...</div>}>
          <SubmitFormContent />
        </Suspense>
      </main>
    </div>
  );
}


