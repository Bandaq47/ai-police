"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightboxModal from "@/components/LightboxModal";
import PostCard from "@/components/PostCard";
import { SURAT_POLICE_STATIONS, POLICE_RANKS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Shield,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  Edit3,
  Sliders,
  Sparkles,
  History,
  Heart,
  MessageSquare,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  X,
  Loader2,
  Send,
  BookOpen,
  Copy,
  Clock,
  Award,
  AlertCircle,
  Maximize2,
  Trash2,
  UserCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

type ProfileTab = "posts" | "submissions" | "liked" | "activity";

function ProfileContent() {
  const {
    user,
    posts,
    submissions,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    updatePrivacySettings,
    fetchPosts,
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active Tab state (synced with query ?tab=...)
  const initialTab = (searchParams.get("tab") as ProfileTab) || "posts";
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    ["posts", "submissions", "liked", "activity"].includes(initialTab)
      ? initialTab
      : "posts"
  );

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(
    searchParams.get("tab") === "privacy"
  );

  // Lightbox state for submissions
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // Avatar uploading state
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // --- Form States for Edit Profile ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rank, setRank] = useState<string>(POLICE_RANKS[6]);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [unit, setUnit] = useState<string>(SURAT_POLICE_STATIONS[0]);
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [editProfileError, setEditProfileError] = useState("");

  // --- Form States for Privacy Settings ---
  const [privacySettings, setPrivacySettings] = useState({
    show_rank: true,
    show_unit: true,
    is_liked_public: true,
    hide_phone: true,
    hide_email: true,
  });
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [privacySuccess, setPrivacySuccess] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Sync initial user data into forms
  useEffect(() => {
    if (user) {
      // Split full_name into first and last name
      const parts = (user.full_name || "").trim().split(/\s+/);
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");

      // Handle rank and gender
      if (user.rank) {
        if (user.rank.endsWith("หญิง")) {
          setRank(user.rank.replace("หญิง", ""));
          setGender("female");
        } else {
          setRank(user.rank);
          setGender("male");
        }
      }

      if (user.unit) setUnit(user.unit);
      if (user.phone) setPhone(user.phone);

      // Privacy settings
      setPrivacySettings({
        show_rank: user.show_rank ?? true,
        show_unit: user.show_unit ?? true,
        is_liked_public: user.is_liked_public ?? true,
        hide_phone: user.hide_phone ?? true,
        hide_email: user.hide_email ?? true,
      });
    }
  }, [user]);

  // Toast auto-clear
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!user) return null;

  // Filtered data for tabs
  const myPosts = posts.filter((p) => p.user_id === user.id);
  const mySubmissions = submissions.filter((s) => s.officer_id === user.id);
  const likedPosts = posts.filter(
    (p) => p.is_liked || p.post_likes?.some((l) => l.user_id === user.id)
  );

  // Total likes received on user's own posts
  const totalLikesReceived = myPosts.reduce(
    (sum, p) => sum + (p.like_count || 0),
    0
  );

  // Handle Avatar Change
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setAvatarError("");
    const res = await uploadAvatar(file);
    setAvatarUploading(false);

    if (res.success) {
      showToast("อัปเดตรูปโปรไฟล์สำเร็จแล้ว");
    } else {
      setAvatarError(res.errorMessage || "ไม่สามารถอัปโหลดรูปภาพได้");
    }
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  // Handle Remove Avatar
  const handleRemoveAvatar = async () => {
    if (!confirm("คุณต้องการลบรูปโปรไฟล์และกลับไปใช้ตัวอักษรย่อเริ่มต้นใช่หรือไม่?")) {
      return;
    }
    setAvatarUploading(true);
    const res = await removeAvatar();
    setAvatarUploading(false);
    if (res.success) {
      showToast("ลบรูปโปรไฟล์เรียบร้อยแล้ว");
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditProfileError("");

    if (!firstName.trim()) {
      setEditProfileError("กรุณากรอกชื่อ");
      return;
    }

    const full_name = `${firstName.trim()} ${lastName.trim()}`.trim();
    let finalRank = rank;
    if (gender === "female" && rank && !rank.endsWith("หญิง")) {
      finalRank = `${rank}หญิง`;
    }

    setSavingProfile(true);
    const res = await updateProfile({
      full_name,
      rank: finalRank,
      unit,
      phone: phone.trim() || undefined,
    });
    setSavingProfile(false);

    if (res.success) {
      setIsEditModalOpen(false);
      showToast("บันทึกข้อมูลส่วนตัวสำเร็จแล้ว");
    } else {
      setEditProfileError(res.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  // Handle Save Privacy
  const handleSavePrivacy = async () => {
    setSavingPrivacy(true);
    const res = await updatePrivacySettings(privacySettings);
    setSavingPrivacy(false);

    if (res.success) {
      setPrivacySuccess(true);
      showToast("บันทึกการตั้งค่าความเป็นส่วนตัวสำเร็จแล้ว");
      setTimeout(() => {
        setPrivacySuccess(false);
        setIsPrivacyModalOpen(false);
      }, 700);
    }
  };

  // Copy prompt helper
  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    showToast("คัดลอกข้อความพรอมต์แล้ว");
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const displayName = `${user.rank ? user.rank + " " : ""}${user.full_name}`;
  const userInitial = user.full_name?.charAt(0) || "ต";

  return (
    <div
      className="min-h-dvh bg-[#F8F7F5]"
      style={{ paddingTop: "calc(56px + env(safe-area-inset-top, 0px))" }}
    >
      <Navbar />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 text-white shadow-2xl backdrop-blur-md flex items-center gap-3 border border-white/10 text-sm font-semibold"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main
        className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6"
        style={{ paddingBottom: "calc(90px + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* ── 1. Profile Header Card ── */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          {/* Top Banner with Oxblood police gradient */}
          <div className="h-32 sm:h-40 oxblood-gradient relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute right-6 top-6 text-white/10 hidden sm:block">
              <Shield className="w-36 h-36" strokeWidth={1} />
            </div>
            {/* Police Station Watermark */}
            <div className="absolute bottom-3 right-4 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md text-[11px] text-amber-200/90 font-medium flex items-center gap-1.5 border border-white/10">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              ตำรวจภูธรจังหวัดสุราษฎร์ธานี
            </div>
          </div>

          {/* Profile Identity Details */}
          <div className="px-5 sm:px-8 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-5">
              {/* Avatar with Camera Overlay */}
              <div className="relative group shrink-0 self-start sm:self-auto">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarFile}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                />
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-white shadow-xl ring-4 ring-[#661D27]/15">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#7a2130] to-[#4A141B] flex items-center justify-center text-white font-bold text-3xl shadow-inner relative">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{userInitial}</span>
                    )}

                    {avatarUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                        <Loader2 className="w-7 h-7 animate-spin text-amber-300" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Camera upload button */}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[#661D27] text-white shadow-lg hover:bg-[#7e2430] active:scale-95 transition-all border-2 border-white"
                  title="เปลี่ยนรูปโปรไฟล์"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons (Edit Profile & Privacy) */}
              <div className="flex items-center gap-2.5 flex-wrap sm:mb-1">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold transition-all flex items-center gap-2 shadow-sm active:scale-95"
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  แก้ไขโปรไฟล์
                </button>

                <button
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 text-sm font-semibold transition-all flex items-center gap-2 shadow-sm active:scale-95"
                >
                  <Sliders className="w-4 h-4 text-slate-500" />
                  ตั้งค่าความเป็นส่วนตัว
                </button>

                {user.avatar_url && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                    title="ลบรูปโปรไฟล์"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Error Message for Avatar */}
            {avatarError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{avatarError}</span>
              </div>
            )}

            {/* Officer Meta Info */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  {displayName}
                  <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 inline" />
                </h1>

                {/* Role Badge */}
                {user.role === "admin" ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-950 flex items-center gap-1.5 shadow-sm">
                    <Award className="w-3.5 h-3.5" />
                    ผู้ดูแลระบบ (Admin)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#661D27]/10 text-[#661D27] flex items-center gap-1.5 border border-[#661D27]/20">
                    <Shield className="w-3.5 h-3.5" />
                    ข้าราชการตำรวจ
                  </span>
                )}
              </div>

              {/* Station and Contact details */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-600 font-medium">
                <div className="flex items-center gap-1.5 text-slate-800 font-semibold bg-slate-100 px-3 py-1 rounded-lg">
                  <Building className="w-4 h-4 text-[#661D27]" />
                  <span>{user.unit || "สถานีตำรวจภูธร"}</span>
                </div>

                {user.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{user.email}</span>
                    {user.hide_email ? (
                      <span
                        className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded"
                        title="ซ่อนจากผู้ใช้อื่น"
                      >
                        🔒 ซ่อนไว้
                      </span>
                    ) : (
                      <span
                        className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium"
                        title="สาธารณะ"
                      >
                        🌐 สาธารณะ
                      </span>
                    )}
                  </div>
                )}

                {user.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{user.phone}</span>
                    {user.hide_phone ? (
                      <span
                        className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded"
                        title="ซ่อนจากผู้ใช้อื่น"
                      >
                        🔒 ซ่อนไว้
                      </span>
                    ) : (
                      <span
                        className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium"
                        title="สาธารณะ"
                      >
                        🌐 สาธารณะ
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100">
              <div
                onClick={() => setActiveTab("submissions")}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-[#661D27]/5 border border-slate-100 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">งานที่ส่งแล้ว</span>
                  <Send className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {mySubmissions.length}
                </p>
                <span className="text-[11px] text-slate-400 font-medium">
                  แบบฝึกปฏิบัติ AI
                </span>
              </div>

              <div
                onClick={() => setActiveTab("posts")}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-[#661D27]/5 border border-slate-100 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">โพสต์ในชุมชน</span>
                  <MessageSquare className="w-4 h-4 text-[#661D27] group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {myPosts.length}
                </p>
                <span className="text-[11px] text-slate-400 font-medium">
                  กระทู้แลกเปลี่ยน
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">ไลก์ที่ได้รับ</span>
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                </div>
                <p className="text-2xl font-black text-rose-600">
                  {totalLikesReceived}
                </p>
                <span className="text-[11px] text-slate-400 font-medium">
                  จากเพื่อนตำรวจ
                </span>
              </div>

              <div
                onClick={() => setActiveTab("liked")}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-[#661D27]/5 border border-slate-100 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">โพสต์ที่ถูกใจ</span>
                  <Sparkles className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {likedPosts.length}
                </p>
                <span className="text-[11px] text-slate-400 font-medium">
                  {privacySettings.is_liked_public ? "🌐 สาธารณะ" : "🔒 เฉพาะฉัน"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Tab Navigation Bar ── */}
        <section className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200/80 flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "posts"
                ? "bg-[#661D27] text-white shadow-md shadow-[#661D27]/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>โพสต์ของฉัน ({myPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("submissions")}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "submissions"
                ? "bg-[#661D27] text-white shadow-md shadow-[#661D27]/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>ผลงานที่ส่ง ({mySubmissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("liked")}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "liked"
                ? "bg-[#661D27] text-white shadow-md shadow-[#661D27]/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Heart className="w-4 h-4 shrink-0" />
            <span>โพสต์ที่ถูกใจ ({likedPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("activity")}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "activity"
                ? "bg-[#661D27] text-white shadow-md shadow-[#661D27]/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <History className="w-4 h-4 shrink-0" />
            <span>ประวัติกิจกรรม</span>
          </button>
        </section>

        {/* ── 3. Tab Content Area ── */}
        <div className="space-y-4">
          {/* TAB 1: My Posts */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              {myPosts.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm space-y-4 max-w-md mx-auto my-6">
                  <div className="p-4 bg-red-50 text-[#661D27] rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    ท่านยังไม่ได้สร้างโพสต์ในฟีดชุมชน
                  </h3>
                  <p className="text-sm text-slate-500">
                    ร่วมแชร์ภาพผลลัพธ์ AI เทคนิคพรอมต์ หรือข้อคิดเห็นร่วมกับเพื่อนๆ ตำรวจ
                  </p>
                  <Link
                    href="/community"
                    className="inline-flex items-center gap-2 px-6 py-2.5 oxblood-gradient text-white rounded-xl text-sm font-bold shadow hover:shadow-md transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    ไปที่ฟีดชุมชนเพื่อสร้างโพสต์
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-w-2xl mx-auto">
                  {myPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: My Submissions */}
          {activeTab === "submissions" && (
            <div className="space-y-4">
              {mySubmissions.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm space-y-4 max-w-md mx-auto my-6">
                  <div className="p-4 bg-emerald-50 text-emerald-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    ยังไม่มีรายการส่งงานในระบบ
                  </h3>
                  <p className="text-sm text-slate-500">
                    ฝึกปฏิบัติเขียนพรอมต์ตามบทเรียน และส่งเข้าระบบเพื่อสะสมผลงาน
                  </p>
                  <Link
                    href="/submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 oxblood-gradient text-white rounded-xl text-sm font-bold shadow hover:shadow-md transition-all"
                  >
                    <Send className="w-4 h-4" />
                    เริ่มส่งงานแรก
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mySubmissions.map((sub, idx) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <span className="text-xs font-bold text-[#661D27] bg-[#661D27]/10 px-3 py-1 rounded-full flex items-center gap-1.5 truncate">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            {sub.lesson_title || "บทเรียนฝึกปฏิบัติ"}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(sub.created_at).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>

                        {/* Image Preview if available */}
                        {sub.image_url && (
                          <div
                            onClick={() =>
                              setSelectedImage({
                                url: sub.image_url!,
                                title: sub.lesson_title || "ผลลัพธ์ AI",
                              })
                            }
                            className="relative h-44 rounded-2xl overflow-hidden cursor-pointer group bg-slate-900 border border-slate-200"
                          >
                            <img
                              src={sub.image_url}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <span className="px-3 py-1.5 rounded-full bg-black/60 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5">
                                <Maximize2 className="w-3.5 h-3.5" /> ดูภาพขนาดใหญ่
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Prompt text */}
                        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                            <span>ข้อความพรอมต์ (Prompt):</span>
                            <button
                              onClick={() => handleCopyPrompt(sub.id, sub.prompt_text)}
                              className="text-[#661D27] hover:underline flex items-center gap-1"
                            >
                              {copiedPromptId === sub.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-600 font-bold">คัดลอกแล้ว</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  คัดลอก
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-mono whitespace-pre-wrap line-clamp-4">
                            {sub.prompt_text}
                          </p>
                        </div>

                        {/* Notes */}
                        {sub.notes && (
                          <p className="text-xs text-slate-500 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-100/60">
                            <strong>บันทึกเพิ่มเติม:</strong> {sub.notes}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ส่งสำเร็จแล้ว
                        </span>
                        <Link
                          href="/submit"
                          className="text-[#661D27] hover:underline flex items-center gap-1 font-semibold"
                        >
                          ส่งงานเพิ่ม <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Liked Posts */}
          {activeTab === "liked" && (
            <div className="space-y-4">
              {!privacySettings.is_liked_public && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between max-w-2xl mx-auto">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>รายการที่ถูกใจนี้ถูกตั้งค่าเป็น <strong>ส่วนตัว (เฉพาะคุณที่เห็น)</strong></span>
                  </div>
                  <button
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="text-amber-800 underline font-semibold hover:text-amber-950"
                  >
                    เปลี่ยนการตั้งค่า
                  </button>
                </div>
              )}

              {likedPosts.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm space-y-4 max-w-md mx-auto my-6">
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    ยังไม่มีโพสต์ที่คุณกดถูกใจ
                  </h3>
                  <p className="text-sm text-slate-500">
                    เมื่อคุณกดหัวใจให้โพสต์ในฟีดชุมชน รายการเหล่านั้นจะถูกบันทึกไว้ที่นี่
                  </p>
                  <Link
                    href="/community"
                    className="inline-flex items-center gap-2 px-6 py-2.5 oxblood-gradient text-white rounded-xl text-sm font-bold shadow hover:shadow-md transition-all"
                  >
                    <Heart className="w-4 h-4" />
                    สำรวจฟีดชุมชน
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-w-2xl mx-auto">
                  {likedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Activity Log */}
          {activeTab === "activity" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-[#661D27]" />
                    ไทม์ไลน์และประวัติการทำกิจกรรม
                  </h3>
                  <p className="text-xs text-slate-500">
                    บันทึกลำดับเหตุการณ์และผลงานของคุณในระบบ AI Police
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  กำลังใช้งาน
                </span>
              </div>

              {/* Activity Timeline List */}
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {/* 1. Account Creation / Onboarding */}
                <div className="relative group">
                  <div className="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-[#661D27] text-white flex items-center justify-center text-[10px] ring-4 ring-white shadow">
                    <UserCheck className="w-3 h-3" />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400">
                      ลงทะเบียนและยืนยันตัวตนสำเร็จ
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      เข้าร่วมระบบฝึกอบรม AI POLICE
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      ยศ {user.rank || "ข้าราชการตำรวจ"} สังกัด {user.unit}
                    </p>
                  </div>
                </div>

                {/* 2. Submissions Milestone */}
                {mySubmissions.length > 0 && (
                  <div className="relative group">
                    <div className="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] ring-4 ring-white shadow">
                      <Send className="w-3 h-3" />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-400">
                        ส่งงานฝึกปฏิบัติล่าสุด:{" "}
                        {new Date(mySubmissions[0].created_at).toLocaleString("th-TH")}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        ส่งงานบทเรียนสำเร็จรวม {mySubmissions.length} รายการ
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        บทเรียนล่าสุด: {mySubmissions[0].lesson_title || "การฝึกเขียนพรอมต์"}
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Community Posts Milestone */}
                {myPosts.length > 0 && (
                  <div className="relative group">
                    <div className="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] ring-4 ring-white shadow">
                      <MessageSquare className="w-3 h-3" />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-400">
                        โพสต์ล่าสุดในชุมชน:{" "}
                        {new Date(myPosts[0].created_at).toLocaleString("th-TH")}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        สร้างกระทู้แลกเปลี่ยนในชุมชนแล้ว {myPosts.length} โพสต์
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                        &quot;{myPosts[0].content}&quot;
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Likes Milestone */}
                {totalLikesReceived > 0 && (
                  <div className="relative group">
                    <div className="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] ring-4 ring-white shadow">
                      <Heart className="w-3 h-3" />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-400">
                        การมีส่วนร่วมในชุมชน
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        ได้รับกำลังใจรวม {totalLikesReceived} ครั้งจากเพื่อนๆ ตำรวจ
                      </h4>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── 4. Modal: Edit Profile ── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 oxblood-gradient text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Edit3 className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">แก้ไขข้อมูลโปรไฟล์</h3>
                    <p className="text-xs text-white/70">
                      จัดการตัวตนและข้อมูลข้าราชการตำรวจของคุณ
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form
                onSubmit={handleSaveProfile}
                className="p-6 space-y-4 overflow-y-auto flex-1"
              >
                {editProfileError && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-100">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{editProfileError}</span>
                  </div>
                )}

                {/* First Name & Last Name (Separated) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      ชื่อจริง <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="เช่น สมชาย"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#661D27] text-sm text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">นามสกุล</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="เช่น ใจดี"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#661D27] text-sm text-slate-800"
                    />
                  </div>
                </div>

                {/* Gender Toggle for Rank Suffix */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">เพศสภาพ (คำต่อท้ายยศ)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender("male")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        gender === "male"
                          ? "bg-[#661D27]/10 text-[#661D27] border-[#661D27]"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      ชาย (เช่น ร.ต.อ.)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("female")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        gender === "female"
                          ? "bg-[#661D27]/10 text-[#661D27] border-[#661D27]"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      หญิง (เช่น ร.ต.อ.หญิง)
                    </button>
                  </div>
                </div>

                {/* Police Rank Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    ยศตำรวจ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#661D27] text-sm text-slate-800 bg-white"
                  >
                    {POLICE_RANKS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                        {gender === "female" ? "หญิง" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit / Police Station */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    สังกัด (สถานีตำรวจภูธร) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#661D27] text-sm text-slate-800 bg-white"
                  >
                    {SURAT_POLICE_STATIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08x-xxx-xxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#661D27] text-sm text-slate-800"
                  />
                </div>

                {/* Role (Locked) */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                    <span>ระดับสิทธิ์การใช้งาน (Role)</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      🔒 ล็อคความปลอดภัย
                    </span>
                  </label>
                  <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-600 font-semibold border border-slate-200">
                    <span>
                      {user.role === "admin"
                        ? "👑 ผู้ดูแลระบบ (Admin)"
                        : "👮‍♂️ ข้าราชการตำรวจ (Officer)"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      สิทธิ์ถูกกำหนดโดยผู้ดูแลระบบ
                    </span>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 rounded-xl oxblood-gradient text-white text-sm font-bold shadow hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>กำลังบันทึก...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>บันทึกข้อมูล</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 5. Modal: Privacy Settings (PDPA) ── */}
      <AnimatePresence>
        {isPrivacyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPrivacyModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Sliders className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">ตั้งค่าความเป็นส่วนตัว</h3>
                    <p className="text-xs text-slate-400">
                      การคุ้มครองข้อมูลส่วนบุคคล (PDPA) ของข้าราชการตำรวจ
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPrivacyModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* PDPA Info banner */}
                <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">การรักษาความปลอดภัยของข้อมูล</strong>
                    คุณสามารถเลือกเปิดเผยหรือซ่อนข้อมูลตำแหน่ง สังกัด และประวัติการกดไลก์ เพื่อความปลอดภัยและความเป็นส่วนตัวในการร่วมแลกเปลี่ยนในชุมชน
                  </div>
                </div>

                {/* Switch 1: Show Rank */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div className="pr-4">
                    <h4 className="text-sm font-bold text-slate-900">
                      แสดงยศตำรวจในฟีดชุมชน
                    </h4>
                    <p className="text-xs text-slate-500">
                      เปิดเพื่อแสดงยศนำหน้าชื่อในโพสต์และคอมเมนต์ หรือปิดหากต้องการแสดงเฉพาะชื่อ
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPrivacySettings((s) => ({ ...s, show_rank: !s.show_rank }))
                    }
                    className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${
                      privacySettings.show_rank ? "bg-[#661D27]" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                        privacySettings.show_rank ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch 2: Show Unit */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div className="pr-4">
                    <h4 className="text-sm font-bold text-slate-900">
                      แสดงสังกัด (สภ.) ในโพสต์
                    </h4>
                    <p className="text-xs text-slate-500">
                      แสดงสถานีตำรวจที่คุณสังกัดใต้ชื่อโพสต์ในฟีด
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPrivacySettings((s) => ({ ...s, show_unit: !s.show_unit }))
                    }
                    className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${
                      privacySettings.show_unit ? "bg-[#661D27]" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                        privacySettings.show_unit ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch 3: Liked Posts Privacy */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div className="pr-4">
                    <h4 className="text-sm font-bold text-slate-900">
                      เปิดเผยรายการโพสต์ที่ถูกใจ
                    </h4>
                    <p className="text-xs text-slate-500">
                      หากปิด เพื่อนสมาชิกคนอื่นจะไม่เห็นแท็บ &quot;โพสต์ที่ถูกใจ&quot; ของคุณ (เป็นส่วนตัว)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPrivacySettings((s) => ({
                        ...s,
                        is_liked_public: !s.is_liked_public,
                      }))
                    }
                    className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${
                      privacySettings.is_liked_public ? "bg-[#661D27]" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                        privacySettings.is_liked_public ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch 4: Hide Phone */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div className="pr-4">
                    <h4 className="text-sm font-bold text-slate-900">
                      ซ่อนเบอร์โทรศัพท์
                    </h4>
                    <p className="text-xs text-slate-500">
                      ซ่อนเบอร์โทรศัพท์ไม่ให้ผู้ใช้อื่นในระบบมองเห็น
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPrivacySettings((s) => ({
                        ...s,
                        hide_phone: !s.hide_phone,
                      }))
                    }
                    className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${
                      privacySettings.hide_phone ? "bg-[#661D27]" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                        privacySettings.hide_phone ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch 5: Hide Email */}
                <div className="flex items-center justify-between py-2">
                  <div className="pr-4">
                    <h4 className="text-sm font-bold text-slate-900">ซ่อนอีเมล</h4>
                    <p className="text-xs text-slate-500">
                      ซ่อนอีเมลส่วนตัวไม่ให้แสดงต่อผู้ใช้อื่น
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPrivacySettings((s) => ({
                        ...s,
                        hide_email: !s.hide_email,
                      }))
                    }
                    className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${
                      privacySettings.hide_email ? "bg-[#661D27]" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                        privacySettings.hide_email ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Modal Actions */}
                <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPrivacyModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePrivacy}
                    disabled={savingPrivacy}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold shadow hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingPrivacy ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>กำลังบันทึก...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>บันทึกการตั้งค่า</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Lightbox Modal for Submissions */}
      {selectedImage && (
        <LightboxModal
          isOpen={Boolean(selectedImage)}
          imageUrl={selectedImage.url}
          title={selectedImage.title}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-[#F8F7F5]">
          <Loader2 className="w-8 h-8 animate-spin text-[#661D27]" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
