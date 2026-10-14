"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  LogOut,
  User,
  BarChart2,
  BookOpen,
  Send,
  History,
  Newspaper,
  X,
  Users,
  Sparkles,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Sliders,
  ShieldCheck,
  Award,
  Lock,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setSheetOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (user && user.is_onboarded === false && pathname !== "/onboarding") {
      router.push("/onboarding");
    }
  }, [user, pathname, router]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isOfficer = user.role === "officer";
  const isAdmin = user.role === "admin";

  const officerLinks = [
    { href: "/dashboard", label: "หน้าหลัก", icon: User },
    { href: "/lessons", label: "บทเรียน", icon: BookOpen },
    { href: "/submit", label: "ส่งงาน", icon: Send },
    { href: "/community", label: "ชุมชน", icon: Users },
    { href: "/profile", label: "โปรไฟล์", icon: Shield },
    { href: "/my-submissions", label: "ประวัติส่งงาน", icon: History },
    { href: "/news", label: "ข่าวสาร", icon: Newspaper },
    { href: "/ai-tools", label: "AI Tools", icon: Sparkles },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "แดชบอร์ด", icon: BarChart2 },
    { href: "/admin/submissions", label: "ดูผลงาน", icon: History },
    { href: "/admin/lessons", label: "บทเรียน", icon: BookOpen },
    { href: "/community", label: "ชุมชน", icon: Users },
    { href: "/profile", label: "โปรไฟล์", icon: Shield },
    { href: "/admin/news", label: "ข่าวสาร", icon: Newspaper },
    { href: "/admin/ai-tools", label: "AI Tools", icon: Sparkles },
  ];

  const links = isAdmin ? adminLinks : officerLinks;
  // Bottom tab: first 4 + "More"
  const tabLinks = links.slice(0, 4);
  const moreLinks = links.slice(4);

  const userInitial = user.full_name?.charAt(0) || "ต";

  return (
    <>
      {/* ── Top Header ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 oxblood-gradient text-white"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          boxShadow: "0 2px 20px rgba(74,20,27,0.35)",
        }}
      >
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link
            href={isAdmin ? "/admin/dashboard" : "/dashboard"}
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
              <Shield className="w-4 h-4 text-amber-300" />
            </div>
            <div className="leading-none">
              <span className="font-extrabold text-base tracking-wide flex items-center gap-2">
                AI POLICE
                {isAdmin && (
                  <span className="text-[10px] bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-full font-bold">
                    ADMIN
                  </span>
                )}
              </span>
              <p className="text-[10px] text-white/55 tracking-wide mt-0.5 hidden xs:block whitespace-nowrap">
                ตำรวจภูธรจังหวัดสุราษฎร์ธานี
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                    active
                      ? "bg-white/20 text-white font-semibold"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right: user dropdown (Desktop) + Quick Profile link (Mobile) */}
          <div className="flex items-center gap-2">
            {/* Mobile Profile Icon */}
            <Link
              href="/profile"
              className="md:hidden flex items-center p-1 rounded-full hover:bg-white/10 transition-colors"
              title="โปรไฟล์ส่วนตัว"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#7a2130] to-[#4A141B] flex items-center justify-center text-white font-bold text-xs ring-2 ring-amber-300/40 shrink-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userInitial
                )}
              </div>
            </Link>

            {/* Desktop User Dropdown Menu */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-2xl hover:bg-white/10 transition-all border border-transparent hover:border-white/15"
              >
                {/* Avatar with online dot */}
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#7a2130] to-[#4A141B] flex items-center justify-center text-white font-bold text-xs ring-2 ring-amber-300/40 shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userInitial
                  )}
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-white" />
                </div>

                {/* Name & Station */}
                <div className="flex flex-col items-start text-left leading-none">
                  <span className="text-sm font-semibold text-white/95 truncate max-w-[150px] whitespace-nowrap">
                    {user.rank ? `${user.rank} ` : ""}
                    {user.full_name}
                  </span>
                  <span className="text-[11px] text-white/55 mt-0.5 truncate max-w-[150px] whitespace-nowrap">
                    {user.unit}
                  </span>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Animated Dropdown Menu */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 z-50 divide-y divide-slate-100"
                  >
                    {/* User Info Header */}
                    <div className="p-4 bg-slate-50 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-[#7a2130] to-[#4A141B] flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-[#661D27]/20">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          userInitial
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {user.rank ? `${user.rank} ` : ""}
                            {user.full_name}
                          </p>
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        </div>
                        <p className="text-xs text-slate-500 truncate">{user.unit}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#661D27]/10 text-[#661D27]">
                          {user.role === "admin"
                            ? "ผู้ดูแลระบบ (Admin)"
                            : "ข้าราชการตำรวจ"}
                        </span>
                      </div>
                    </div>

                    {/* Menu Links */}
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-[#661D27]/8 hover:text-[#661D27] transition-colors"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-100 text-[#661D27]">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <span>โปรไฟล์และประวัติกิจกรรม</span>
                          <p className="text-[11px] text-slate-400 font-normal">
                            ดูผลงาน ไลก์ และสถิติ
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </Link>

                      <Link
                        href="/profile?tab=privacy"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-[#661D27]/8 hover:text-[#661D27] transition-colors"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                          <Sliders className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <span>ตั้งค่าความเป็นส่วนตัว</span>
                          <p className="text-[11px] text-slate-400 font-normal">
                            การคุ้มครองข้อมูล PDPA
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </Link>

                      <Link
                        href="/my-submissions"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-[#661D27]/8 hover:text-[#661D27] transition-colors"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                          <History className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <span>ผลงานที่ส่งแล้ว</span>
                          <p className="text-[11px] text-slate-400 font-normal">
                            งานฝึกเขียนพรอมต์ AI
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </Link>
                    </div>

                    {/* Logout Option */}
                    <div className="p-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="bottom-tab-bar md:hidden">
        <div className="flex items-stretch w-full h-[60px]">
          {tabLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-1 transition-all relative"
              >
                {/* Active bg pill */}
                {active && (
                  <motion.div
                    layoutId="tab-active-pill"
                    className="absolute top-1.5 rounded-2xl"
                    style={{
                      width: 48,
                      height: 32,
                      background: "rgba(102,29,39,0.1)",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <div className="relative z-10">
                  <Icon
                    style={{ width: 22, height: 22 }}
                    className={active ? "text-[#661D27]" : "text-slate-400"}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium leading-none relative z-10 ${
                    active ? "text-[#661D27] font-semibold" : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
                {active && <div className="tab-active-dot" />}
              </Link>
            );
          })}

          {/* More button */}
          {moreLinks.length > 0 && (
            <button
              onClick={() => setSheetOpen(true)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all relative ${
                moreLinks.some((l) => l.href === pathname)
                  ? "text-[#661D27]"
                  : "text-slate-400"
              }`}
            >
              {moreLinks.some((l) => l.href === pathname) && (
                <motion.div
                  layoutId="tab-active-pill"
                  className="absolute top-1.5 rounded-2xl"
                  style={{
                    width: 48,
                    height: 32,
                    background: "rgba(102,29,39,0.1)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <div className="relative z-10">
                <MoreHorizontal
                  style={{ width: 22, height: 22 }}
                  strokeWidth={1.8}
                />
              </div>
              <span className="text-[10px] font-medium leading-none relative z-10">
                เพิ่มเติม
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* ── Bottom Sheet (More Menu) ── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              style={{ backdropFilter: "blur(2px)" }}
            />

            {/* Sheet panel */}
            <motion.div
              key="sheet-panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 38 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl md:hidden"
              style={{
                paddingBottom: "env(safe-area-inset-bottom, 16px)",
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
              </div>

              {/* User card (clickable to /profile) */}
              <Link
                href="/profile"
                onClick={() => setSheetOpen(false)}
                className="mx-4 mt-2 mb-4 bg-[#F5F4F2] hover:bg-[#661D27]/5 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 transition-colors"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#7a2130] to-[#4A141B] flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-[#661D27]/20">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userInitial
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 leading-tight truncate">
                    {user.rank ? `${user.rank} ` : ""}
                    {user.full_name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{user.unit}</p>
                  <span className="text-[11px] text-[#661D27] font-semibold flex items-center gap-1 mt-1">
                    จัดการโปรไฟล์และผลงาน <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>

              {/* More links */}
              <div className="px-4 space-y-1 pb-2">
                {moreLinks.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setSheetOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                        active
                          ? "bg-[#661D27]/8 text-[#661D27]"
                          : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl ${
                          active ? "bg-[#661D27]/10" : "bg-slate-100"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            active ? "text-[#661D27]" : "text-slate-500"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-base font-medium flex-1 ${
                          active ? "font-semibold" : ""
                        }`}
                      >
                        {label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </Link>
                  );
                })}

                {/* Privacy settings link */}
                <Link
                  href="/profile?tab=privacy"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all"
                >
                  <div className="p-2 rounded-xl bg-slate-100">
                    <Sliders className="w-5 h-5 text-slate-500" />
                  </div>
                  <span className="text-base font-medium flex-1">
                    ตั้งค่าความเป็นส่วนตัว
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>
              </div>

              {/* Divider + Logout */}
              <div className="mx-4 mt-2 pt-3 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-600 active:bg-red-50 transition-all"
                >
                  <div className="p-2 rounded-xl bg-red-50">
                    <LogOut className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="text-base font-medium">ออกจากระบบ</span>
                </button>
              </div>

              {/* Close button */}
              <button
                onClick={() => setSheetOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
