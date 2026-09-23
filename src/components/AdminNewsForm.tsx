"use client";

import React, { useState } from "react";
import { Plus, Link as LinkIcon, Sparkles, CheckCircle } from "lucide-react";
import { YoutubeIcon } from "@/components/YoutubeIcon";
import { useAuth } from "@/context/AuthContext";
import {
  extractYouTubeUrl,
  getYouTubeThumbnailUrl,
  getYouTubeVideoId,
} from "@/lib/youtube-utils";

export default function AdminNewsForm() {
  const { addNews } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [url, setUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Detect YouTube URL in either field
  const detectedYtUrl =
    (youtubeUrl && getYouTubeVideoId(youtubeUrl) ? youtubeUrl : null) ||
    (url && getYouTubeVideoId(url) ? url : null);

  const previewThumbnail = detectedYtUrl ? getYouTubeThumbnailUrl(detectedYtUrl) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setLoading(true);
    setStatusMsg(null);

    // If user pasted a YouTube link into url field by mistake, also pass it as youtube_url
    const finalYoutubeUrl = youtubeUrl.trim() || (detectedYtUrl ? detectedYtUrl : "");
    const finalUrl = url.trim();

    const success = await addNews(title.trim(), body.trim(), urgent, finalUrl, finalYoutubeUrl);
    setLoading(false);

    if (success) {
      setTitle("");
      setBody("");
      setUrgent(false);
      setUrl("");
      setYoutubeUrl("");
      setStatusMsg({ type: "success", text: "เพิ่มข่าวสาร/วิดีโอสำเร็จเรียบร้อยแล้ว" });
      setTimeout(() => setStatusMsg(null), 3500);
    } else {
      setStatusMsg({ type: "error", text: "เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง" });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#661D27]" />
          เพิ่มประกาศ / วิดีโอข่าวสารใหม่
        </h2>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {statusMsg.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
          {statusMsg.text}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          หัวข้อประกาศ / ชื่อวิดีโอ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="เช่น AI คืออะไร? สรุปจบใน 7 นาที หรือ กำหนดการส่งงาน"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#661D27]/20 focus:border-[#661D27] transition-all"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          เนื้อหา / คำอธิบาย <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={3}
          placeholder="รายละเอียดเนื้อหา ข้อความชี้แจง หรือสรุปใจความสำคัญ..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#661D27]/20 focus:border-[#661D27] transition-all"
        />
      </div>

      {/* YouTube Link with Live Preview */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <YoutubeIcon className="w-4 h-4 text-red-600" />
            ลิงก์ YouTube (ตัวเลือก)
          </span>
          <span className="text-[11px] text-slate-400 font-normal">รองรับ Watch, Shorts, youtu.be</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... หรือ https://youtu.be/..."
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
        </div>

        {/* Live YouTube Thumbnail Preview in Admin Form */}
        {previewThumbnail && (
          <div className="mt-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-white flex items-center gap-3">
            <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
              <img
                src={previewThumbnail}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-5 h-4 rounded bg-[#701520] flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[6px] border-l-white border-b-[3px] border-b-transparent ml-0.5" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> ตรวจพบวิดีโอ YouTube พร้อมแสดงผล
              </p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {detectedYtUrl}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* General URL Link */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
          ลิงก์เว็บไซต์ / เอกสารแนบ (ตัวเลือก)
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/document.pdf"
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Urgent Checkbox */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
        <input
          type="checkbox"
          id="urgent"
          checked={urgent}
          onChange={(e) => setUrgent(e.target.checked)}
          className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
        />
        <label htmlFor="urgent" className="text-xs text-slate-800 font-semibold cursor-pointer select-none">
          🚨 ตั้งเป็นประกาศด่วน (แสดงแท็กสีแดงกระพริบ)
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#661D27] text-white rounded-xl font-bold hover:bg-[#822432] active:scale-[0.99] transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        {loading ? "กำลังบันทึกข้อมูล..." : "บันทึกและเผยแพร่ข่าวสาร"}
      </button>
    </form>
  );
}
