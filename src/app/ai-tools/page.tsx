"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  ExternalLink,
  MessageSquare,
  Image as ImageIcon,
  Video,
  FileText,
  Bot,
  LayoutGrid
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

type AITool = {
  id: string;
  name: string;
  category: string;
  description: string;
  how_it_helps: string;
  url: string;
  image_url: string;
};

const CATEGORIES = [
  { id: "ทั้งหมด", label: "ทั้งหมด", icon: LayoutGrid },
  { id: "ข้อความ", label: "ข้อความ", icon: MessageSquare },
  { id: "รูปภาพ", label: "รูปภาพ", icon: ImageIcon },
  { id: "วิดีโอ", label: "วิดีโอ", icon: Video },
  { id: "รายงาน", label: "รายงาน", icon: FileText },
  { id: "AI Agent", label: "AI Agent", icon: Bot },
];

export default function AIToolsPage() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ai_tools")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error("Error fetching tools:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTools =
    activeCategory === "ทั้งหมด"
      ? tools
      : tools.filter((tool) => tool.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4F2]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 bg-[#661D27]/10 px-4.5 py-2 rounded-full text-base font-semibold text-[#661D27]">
            <Sparkles className="w-4.5 h-4.5" />
            Module เครื่องมือ AI
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            รวมเครื่องมือ AI สำหรับงานตำรวจ
          </h1>
          <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
            เลือกใช้งาน AI Assistants ที่เหมาะสมกับงานของคุณ เพื่อเพิ่มประสิทธิภาพและลดเวลาในการทำงาน
          </p>
        </div>

        {/* Categories / Filters */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-8">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-base font-semibold transition-all duration-200 shadow-sm cursor-pointer whitespace-nowrap
                  ${
                    isActive
                      ? "bg-[#661D27] text-white shadow-md scale-105"
                      : "bg-white text-slate-600 hover:bg-slate-50 hover:text-[#661D27]"
                  }
                `}
              >
                <cat.icon className="w-4.5 h-4.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Tools Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#661D27]"></div>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <Bot className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base text-slate-500">ยังไม่มีเครื่องมือในหมวดหมู่นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filteredTools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full"
              >
                {/* Top Half: Logo / Header */}
                <div className="p-6 pb-4 flex flex-col items-center text-center border-b border-slate-50 bg-slate-50/50 relative min-h-[9rem]">
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur text-xs font-semibold px-3 py-1 rounded-md text-slate-600 shadow-sm whitespace-nowrap">
                    {tool.category}
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center p-2.5 mb-3 overflow-hidden border border-slate-100 group-hover:scale-105 transition-transform shrink-0">
                    {tool.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tool.image_url}
                        alt={tool.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg';
                        }}
                      />
                    ) : (
                      <Bot className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#661D27] transition-colors leading-tight line-clamp-2">
                    {tool.name}
                  </h3>
                </div>

                {/* Bottom Half: Details */}
                <div className="p-5 flex flex-col flex-1 gap-3.5">
                  {/* รายละเอียด */}
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      รายละเอียด
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed min-h-[2.5rem] max-h-[4rem] scroll-thin pr-1">
                      {tool.description}
                    </p>
                  </div>

                  {/* ช่วยงาน */}
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      ช่วยงานอะไรได้บ้าง
                    </div>
                    <div className="text-sm text-slate-800 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/50 min-h-[5rem] max-h-[7rem] scroll-thin-amber leading-relaxed">
                      {tool.how_it_helps}
                    </div>
                  </div>

                  {/* ปุ่มชิดล่างเสมอ */}
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto w-full py-3 bg-slate-900 hover:bg-[#661D27] text-white rounded-xl text-base font-semibold transition-colors flex items-center justify-center gap-2 group/btn whitespace-nowrap shadow-sm"
                  >
                    <span>เข้าสู่เว็บไซต์</span>
                    <ExternalLink className="w-4.5 h-4.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
