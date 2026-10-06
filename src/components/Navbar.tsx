"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  React.useEffect(() => {
    if (user && user.is_onboarded === false && pathname !== '/onboarding') {
      router.push('/onboarding');
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
    { href: "/dashboard",       label: "หน้าหลัก",      icon: User },
    { href: "/lessons",         label: "บทเรียน",        icon: BookOpen },
    { href: "/submit",          label: "ส่งงาน",         icon: Send },
    { href: "/my-submissions",  label: "ประวัติ",         icon: History },
    { href: "/news",            label: "ข่าวสาร",        icon: Newspaper },
    { href: "/ai-tools",        label: "AI Tools",       icon: Sparkles },
    { href: "/community",       label: "ชุมชน",          icon: Users },
  ];

  const adminLinks = [
    { href: "/admin/dashboard",    label: "แดชบอร์ด",       icon: BarChart2 },
    { href: "/admin/submissions",  label: "ดูผลงาน",        icon: History },
    { href: "/admin/lessons",      label: "บทเรียน",        icon: BookOpen },
    { href: "/admin/news",         label: "ข่าวสาร",        icon: Newspaper },
    { href: "/admin/ai-tools",     label: "AI Tools",       icon: Sparkles },
    { href: "/community",          label: "ชุมชน",          icon: Users },
  ];

  const links = isAdmin ? adminLinks : officerLinks;
  // Bottom tab: first 4 + "More"
  const tabLinks = links.slice(0, 4);
  const moreLinks = links.slice(4);

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

          {/* Right: user info + logout */}
          <div className="flex items-center gap-2">
            {/* User info desktop */}
            <div className="hidden md:flex flex-col items-end text-right leading-none mr-1">
              <span className="text-sm font-semibold text-white/95 truncate max-w-[180px] whitespace-nowrap">
                {user.rank ? `${user.rank} ` : ""}{user.full_name}
              </span>
              <span className="text-xs text-white/55 mt-0.5 truncate max-w-[180px] whitespace-nowrap">
                {user.unit}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10
                         rounded-xl text-sm font-medium transition-all border border-white/0 hover:border-white/20 whitespace-nowrap"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
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

              {/* User card */}
              <div className="mx-4 mt-2 mb-4 bg-[#F5F4F2] rounded-2xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#661D27]/10 border border-[#661D27]/20 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-[#661D27]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 leading-tight truncate">
                    {user.rank ? `${user.rank} ` : ""}{user.full_name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{user.unit}</p>
                </div>
              </div>

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
                      <div className={`p-2 rounded-xl ${active ? "bg-[#661D27]/10" : "bg-slate-100"}`}>
                        <Icon className={`w-5 h-5 ${active ? "text-[#661D27]" : "text-slate-500"}`} />
                      </div>
                      <span className={`text-base font-medium flex-1 ${active ? "font-semibold" : ""}`}>
                        {label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </Link>
                  );
                })}
              </div>

              {/* Divider + Logout */}
              <div className="mx-4 mt-2 pt-3 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-600
                             active:bg-red-50 transition-all"
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
