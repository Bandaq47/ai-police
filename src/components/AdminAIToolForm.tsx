"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, Pencil, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = ["ข้อความ", "รูปภาพ", "วิดีโอ", "รายงาน", "AI Agent"];

type AITool = {
  id: string;
  name: string;
  category: string;
  description: string;
  how_it_helps: string;
  url: string;
  image_url: string;
};

type Props = {
  onSuccess?: () => void;
  initialData?: AITool | null;
  onCancel?: () => void;
};

export default function AdminAIToolForm({ onSuccess, initialData, onCancel }: Props) {
  const isEditMode = !!initialData;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "ข้อความ",
    description: "",
    how_it_helps: "",
    url: "",
    image_url: "",
  });

  // Sync form when initialData changes (entering edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        description: initialData.description,
        how_it_helps: initialData.how_it_helps,
        url: initialData.url,
        image_url: initialData.image_url,
      });
    } else {
      setFormData({
        name: "",
        category: "ข้อความ",
        description: "",
        how_it_helps: "",
        url: "",
        image_url: "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      if (isEditMode && initialData) {
        // UPDATE
        const { error } = await supabase
          .from("ai_tools")
          .update(formData)
          .eq("id", initialData.id);
        if (error) throw error;
        alert("แก้ไขเครื่องมือ AI สำเร็จ!");
      } else {
        // INSERT
        const { error } = await supabase.from("ai_tools").insert([formData]);
        if (error) throw error;
        alert("เพิ่มเครื่องมือ AI สำเร็จ!");
      }

      setFormData({
        name: "",
        category: "ข้อความ",
        description: "",
        how_it_helps: "",
        url: "",
        image_url: "",
      });
      if (onSuccess) onSuccess();
      if (onCancel) onCancel(); // close edit mode after save
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6 transition-all ${
        isEditMode ? "border-amber-400 ring-2 ring-amber-400/20" : "border-slate-200"
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            {isEditMode ? (
              <>
                <Pencil className="w-5 h-5 text-amber-500" />
                แก้ไขเครื่องมือ AI
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5 text-[#661D27]" />
                เพิ่มเครื่องมือ AI ใหม่
              </>
            )}
          </h2>
          {isEditMode && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="ยกเลิกการแก้ไข"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">
          {isEditMode
            ? `กำลังแก้ไข: ${initialData?.name}`
            : "กรอกข้อมูลเพื่อแสดงใน Module เครื่องมือ AI ของผู้ใช้"}
        </p>
      </div>

      <div className="space-y-4">
        {/* Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">ชื่อเครื่องมือ (Name) *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-[#661D27]/20 focus:border-[#661D27] transition-all"
              placeholder="เช่น ChatGPT"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">หมวดหมู่ (Category) *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-[#661D27]/20 focus:border-[#661D27] transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">รายละเอียด (Description)</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-[#661D27]/20 focus:border-[#661D27] transition-all"
            placeholder="ผู้ช่วย AI อัจฉริยะจาก OpenAI"
          />
        </div>

        {/* How it helps */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">ช่วยงานอะไรได้บ้าง (How it helps)</label>
          <textarea
            rows={2}
            value={formData.how_it_helps}
            onChange={(e) => setFormData({ ...formData, how_it_helps: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-[#661D27]/20 focus:border-[#661D27] transition-all resize-none"
            placeholder="ช่วยร่างหนังสือราชการ สรุปรายงาน..."
          />
        </div>

        {/* URL & Image URL */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">ลิงก์เว็บไซต์ (URL) *</label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-[#661D27]/20 focus:border-[#661D27] transition-all"
              placeholder="https://chat.openai.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">ลิงก์รูปโลโก้ (Image URL)</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-[#661D27]/20 focus:border-[#661D27] transition-all"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {isEditMode && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            <X className="w-4 h-4" />
            ยกเลิก
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`flex items-center justify-center gap-2 py-3 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${
            isEditMode
              ? "flex-1 bg-amber-500 hover:bg-amber-600"
              : "w-full oxblood-gradient"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : isEditMode ? (
            <>
              <Pencil className="w-4 h-4" />
              บันทึกการแก้ไข
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              เพิ่มข้อมูล
            </>
          )}
        </button>
      </div>
    </form>
  );
}
