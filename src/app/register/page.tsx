"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SURAT_POLICE_STATIONS } from "@/lib/constants";
import {
  Shield,
  User,
  Mail,
  Lock,
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import bgImage from "./33.png"
// ====================================================
// ✏️  CONFIGURABLE: ภาพพื้นหลังด้านขวาหน้า Register
// ====================================================
const BG_IMAGE = bgImage.src;
 
const INFO_POINTS = [
  {
    icon: " ",
    title: "เรียนรู้ AI Prompt Writing",
    desc: "ฝึกเขียนพรอมต์สำหรับงานตำรวจจริง",
  },
  {
    icon: " ",
    title: "ติดตามผลข่าวสารให้ความรู้ได้",
    desc: "มีข่าวสารให้ความรู้",
  },
  {
    icon: " ",
    title: "เรียนรู้และนำไปใช้",
    desc: "สามรถศึกษาและนำมาใช้ได้",
  },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [unit, setUnit] = useState<string>(SURAT_POLICE_STATIONS[0]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = (() => {
    if (!password) return 0;
    if (password.length < 6) return 1;
    if (password.length < 8) return 2;
    return 3;
  })();

  const strengthLabel = ["", "อ่อนแอ", "พอใช้", "แข็งแกร่ง"][passwordStrength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-emerald-500"][passwordStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) { setError("กรุณากรอกชื่อ-นามสกุล"); return; }
    if (!email.trim()) { setError("กรุณากรอกอีเมล"); return; }
    if (!password || password.length < 6) { setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    if (password !== confirmPassword) { setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน"); return; }
    if (!unit) { setError("กรุณาเลือกสถานีตำรวจภูธรสังกัด"); return; }

    setLoading(true);
    try {
      const res = await register({
        full_name: fullName.trim(),
        unit,
        email: email.trim(),
        password,
      });
      if (res.success) {
        router.push("/lessons");
      } else {
        setError(res.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก (อีเมลอาจถูกใช้งานแล้ว)");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสมัครสมาชิก");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ============================================
          ซ้าย: ฟอร์มลงทะเบียน
          ============================================ */}
      <div className="w-full lg:w-[55%] xl:w-[52%] flex flex-col justify-center px-8 sm:px-12 xl:px-16 py-12 overflow-y-auto bg-white">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">AI POLICE</span>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5 tracking-wide uppercase">
                ตำรวจภูธรจังหวัดสุราษฎร์ธานี
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 leading-snug">
            ลงทะเบียนเข้าอบรม
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">
            สร้างบัญชีผู้เข้าอบรมสำหรับระบบ AI POLICE
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              ชื่อ-นามสกุล <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="สมชาย ใจดี"
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-[#661D27]/25 focus:border-[#661D27]
                           focus:bg-white transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Unit */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              <Building className="w-3.5 h-3.5 inline mr-1 text-[#661D27]" />
              สถานีตำรวจภูธรที่สังกัด <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-[#661D27]/25 focus:border-[#661D27]
                           focus:bg-white transition-all font-medium text-slate-800 cursor-pointer"
              >
                {SURAT_POLICE_STATIONS.map((station) => (
                  <option key={station} value={station}>{station}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              <Mail className="w-3.5 h-3.5 inline mr-1 text-[#661D27]" />
              อีเมลสำหรับเข้าสู่ระบบ <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@police.go.th"
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-[#661D27]/25 focus:border-[#661D27]
                           focus:bg-white transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                รหัสผ่าน <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="w-full pl-10 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-[#661D27]/25 focus:border-[#661D27]
                             focus:bg-white transition-all placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              {password && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= passwordStrength ? strengthColor : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500">{strengthLabel}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                ยืนยันรหัสผ่าน <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านซ้ำอีกครั้ง"
                  className={`w-full pl-10 pr-10 py-3 text-sm border rounded-xl
                             focus:outline-none focus:bg-white transition-all placeholder:text-slate-300 ${
                                confirmPassword && confirmPassword !== password
                                  ? "border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-300/25"
                                  : "bg-slate-50 border-slate-200 focus:ring-2 focus:ring-[#661D27]/25 focus:border-[#661D27]"
                              }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 oxblood-gradient text-white rounded-xl font-semibold text-sm
                       shadow-lg shadow-red-950/20 hover:shadow-xl hover:shadow-red-950/25
                       hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-1"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>กำลังสร้างบัญชี...</span>
              </>
            ) : (
              <>
                <span>ยืนยันการลงทะเบียน</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500 pt-2">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="font-semibold text-[#661D27] hover:underline underline-offset-2">
              กลับสู่หน้าเข้าสู่ระบบ
            </Link>
          </p>
        </motion.form>

        <p className="text-center text-[10px] text-slate-300 mt-8">
          © 2026 ตำรวจภูธรจังหวัดสุราษฎร์ธานี • ระบบ AI POLICE v1.0
        </p>
      </div>

      {/* ============================================
          ขวา: รูปภาพ + Info Points
          ============================================ */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] relative overflow-hidden flex-col justify-end">
        {/* Background */}
        <img
          src={BG_IMAGE}
          alt="Police training"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        {/* Content overlay */}
        <div className="relative z-10 p-10 pb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium px-4 py-2 rounded-full mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            อบรม AI POLICE • ตร.ภ.จว.สุราษฎร์ธานี
          </div>

          <h2 className="text-white text-2xl font-bold leading-snug mb-2">
            เริ่มต้นเส้นทาง<br />
            <span className="text-amber-400">ตำรวจยุค AI</span> วันนี้
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-8">
            เรียนรู้การใช้ AI เพื่อเพิ่มประสิทธิภาพการปฏิบัติงาน<br />
            ผ่านระบบฝึกปฏิบัติที่ออกแบบมาเพื่อใช่งานในการเรียนรู้ศึกษา AI 
          </p>

          {/* Info Points */}
          <div className="space-y-4">
            {INFO_POINTS.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4"
              >
                <span className="text-2xl">{point.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{point.title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{point.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
