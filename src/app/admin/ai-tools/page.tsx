"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminAIToolForm from "@/components/AdminAIToolForm";
import { createClient } from "@/lib/supabase/client";
import { 
  Sparkles, 
  Trash2, 
  CheckSquare, 
  Square, 
  Bot,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AITool = {
  id: string;
  name: string;
  category: string;
  description: string;
  how_it_helps: string;
  url: string;
  image_url: string;
};

export default function AdminAIToolsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) router.push("/login");
    else if (user.role !== "admin") router.push("/dashboard");
    else fetchTools();
  }, [user, router]);

  const fetchTools = async () => {
    setLoading(true);
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

  if (!user || user.role !== "admin") return null;

  // Toggle single item selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all or deselect all
  const handleSelectAll = () => {
    if (selectedIds.length === tools.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tools.map((item) => item.id));
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const count = selectedIds.length;
    const confirmMsg =
      count === 1
        ? "คุณต้องการลบเครื่องมือ AI นี้ใช่หรือไม่?"
        : `คุณต้องการลบเครื่องมือ AI ที่เลือกทั้งหมด ${count} รายการใช่หรือไม่?`;

    if (!window.confirm(confirmMsg)) return;

    setIsDeleting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("ai_tools")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;
      
      setSelectedIds([]);
      fetchTools();
    } catch (error: any) {
      console.error("Error deleting tools:", error);
      alert("เกิดข้อผิดพลาดในการลบรายการ: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const isAllSelected = tools.length > 0 && selectedIds.length === tools.length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4F2]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#661D27]/10 text-[#661D27] rounded-full text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            ระบบแอดมิน (Admin Management)
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            จัดการ Module เครื่องมือ AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            เพิ่มข้อมูลเครื่องมือ AI, รูปภาพโลโก้ และลิงก์เพื่อให้ผู้เข้าอบรมนำไปใช้งาน
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Component */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <AdminAIToolForm onSuccess={fetchTools} />
            </div>
          </div>

          {/* List of Tools with Checkbox Selection */}
          <div className="lg:col-span-7 space-y-4">
            {/* Header & Selection Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  disabled={tools.length === 0}
                  className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#661D27] transition-colors cursor-pointer disabled:opacity-40"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-red-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>{isAllSelected ? "ยกเลิกการเลือกทั้งหมด" : "เลือกทั้งหมด"}</span>
                </button>

                <span className="text-xs text-slate-400 font-medium border-l border-slate-200 pl-3">
                  ทั้งหมด {tools.length} รายการ
                </span>
              </div>

              {/* Action Toolbar when items selected */}
              <AnimatePresence>
                {selectedIds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                      เลือกแล้ว {selectedIds.length} รายการ
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isDeleting ? "กำลังลบ..." : `ลบที่เลือก (${selectedIds.length})`}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* List */}
            {loading ? (
               <div className="flex justify-center py-20">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#661D27]"></div>
               </div>
            ) : tools.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-sm space-y-1">
                <Bot className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-sm">ยังไม่มีเครื่องมือ AI ในระบบ</p>
                <p className="text-xs text-slate-400">ใช้ฟอร์มด้านซ้ายเพื่อเพิ่มข้อมูลใหม่</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {tools.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`relative bg-white rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden ${
                        isSelected
                          ? "border-red-400 ring-2 ring-red-400/20 shadow-md bg-red-50/10"
                          : "border-slate-100 shadow-sm hover:border-slate-300"
                      }`}
                    >
                      {/* Checkbox overlay */}
                      <div
                        className="absolute top-3 right-3 z-10 cursor-pointer p-1 bg-white/50 backdrop-blur rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(item.id);
                        }}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-red-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                        )}
                      </div>

                      <div className="p-4 flex items-start gap-4">
                        <div className="w-14 h-14 shrink-0 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-2">
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg';
                            }}/>
                          ) : (
                            <Bot className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-[#661D27] mb-0.5">{item.category}</div>
                          <h3 className="font-bold text-slate-900 leading-tight">{item.name}</h3>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                            {item.url.replace(/^https?:\/\//, '').split('/')[0]}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      
                      <div className="px-4 pb-4 border-t border-slate-50 pt-3 mt-auto">
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          <span className="font-semibold">ช่วยงาน: </span>
                          {item.how_it_helps}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
