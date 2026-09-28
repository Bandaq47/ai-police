"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SURAT_POLICE_STATIONS, POLICE_RANKS } from "@/lib/constants";
import {
  Shield,
  User,
  Building,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BadgeCheck,
} from "lucide-react";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const { user, loading, updateProfile } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [rank, setRank] = useState<string>(POLICE_RANKS[6]); // ค่าเริ่มต้น เช่น ร.ต.อ.
  const [unit, setUnit] = useState<string>(SURAT_POLICE_STATIONS[0]);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }

      // ถ้ากรอกข้อมูลเรียบร้อยแล้ว ให้ข้ามไปหน้าบทเรียน
      if (user.is_onboarded && user.unit && user.full_name) {
        router.push(user.role === "admin" ? "/admin/dashboard" : "/lessons");
        return;
      }

      // Prefill ชื่อจาก Google
      if (user.full_name) {
        setFullName(user.full_name);
      }
      if (user.rank) {
        setRank(user.rank);
      }
      if (user.unit) {
        setUnit(user.unit);
      }
      if (user.phone) {
        setPhone(user.phone);
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("กรุณากรอกชื่อ-นามสกุลจริง");
      return;
    }
    if (!unit) {
      setError("กรุณาเลือกสถานีตำรวจภูธรหรือหน่วยงานที่สังกัด");
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({
        full_name: fullName.trim(),
        rank: rank || undefined,
        unit,
        phone: phone.trim() || undefined,
      });

      if (res.success) {
        router.push(user?.role === "admin" ? "/admin/dashboard" : "/lessons");
      } else {
        setError(res.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F8]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#661D27]/30 border-t-[#661D27] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F5F4F2]">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#661D27]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl relative"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#661D27]/10 text-[#661D27] text-xs font-semibold">
              <BadgeCheck className="w-4 h-4" />
              ยินดีต้อนรับสู่ระบบ AI POLICE
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              บันทึกข้อมูลประวัติผู้ใช้งาน
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              กรุณาระบุยศ ชื่อ-สกุล และสังกัดของท่าน เพื่อใช้สำหรับการส่งงานและแสดงผลในใบประกาศนียบัตร
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
                ⚠️ {error}
              </div>
            )}

            {/* Readonly Google Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>บัญชี Google ที่เข้าสู่ระบบ</span>
                <span className="text-[11px] font-normal text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> เชื่อมต่อแล้ว
                </span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  readOnly
                  disabled
                  value={user?.email || ""}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            {/* Rank & Full Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-bold text-slate-700">
                  ยศ (Rank)
                </label>
                <select
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#661D27]/20 focus:border-[#661D27] transition-all font-medium"
                >
                  <option value="">(ไม่ระบุ)</option>
                  {POLICE_RANKS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">
                  ชื่อ - นามสกุลจริง *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="สมชาย ใจดี"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#661D27]/20 focus:border-[#661D27] transition-all placeholder:text-slate-300 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Unit / Police Station */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#661D27]" />
                สถานีตำรวจภูธร / หน่วยงานที่สังกัด *
              </label>
              <select
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#661D27]/20 focus:border-[#661D27] transition-all font-medium"
              >
                {SURAT_POLICE_STATIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                เลือกหน่วยงานในสังกัดตำรวจภูธรจังหวัดสุราษฎร์ธานี
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>เบอร์โทรศัพท์ติดต่อ (ไม่บังคับ)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081-234-5678"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#661D27]/20 focus:border-[#661D27] transition-all placeholder:text-slate-300 font-medium"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 oxblood-gradient text-white rounded-xl font-bold text-sm shadow-lg shadow-red-950/20 hover:shadow-xl hover:shadow-red-950/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none pt-3 mt-4 cursor-pointer"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <span>บันทึกข้อมูลและเริ่มใช้งาน</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Note */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              ข้อมูลนี้จะใช้เพื่อบันทึกประวัติการส่งงานในระบบ AI POLICE เท่านั้น
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
