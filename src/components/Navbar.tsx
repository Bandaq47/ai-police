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
  Menu,
  X,
  Users,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    { href: "/my-submissions",  label: "ประวัติส่งงาน",  icon: History },
    { href: "/news",            label: "ข่าวสาร",        icon: Newspaper },
    { href: "/ai-tools",        label: "AI Tools",       icon: Sparkles },
    { href: "/community",       label: "ชุมชน",          icon: Users },
  ];

  const adminLinks = [
    { href: "/admin/dashboard",    label: "แดชบอร์ด",       icon: BarChart2 },
    { href: "/admin/submissions",  label: "ดูผลงาน",        icon: History },
    { href: "/admin/lessons",      label: "จัดการบทเรียน",  icon: BookOpen },
    { href: "/admin/news",         label: "จัดการข่าวสาร",  icon: Newspaper },
    { href: "/admin/ai-tools",     label: "จัดการ AI Tools", icon: Sparkles },
    { href: "/community",          label: "ชุมชน",          icon: Users },
  ];

  const links = isAdmin ? adminLinks : officerLinks;

  return (
    <>
      <header className="sticky top-0 z-40 w-full oxblood-gradient text-white shadow-lg shadow-red-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ── Logo ── */}
            <Link
              href={isAdmin ? "/admin/dashboard" : "/dashboard"}
              className="flex items-center gap-3 group shrink-0"
            >
              <div className="leading-none">
                <span className="font-extrabold text-xl tracking-wide flex items-center gap-2">
                  AI POLICE
                  {isAdmin && (
                    <span className="text-xs bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                      ADMIN
                    </span>
                  )}
                </span>
                <p className="text-xs text-white/60 hidden sm:block tracking-wide mt-0.5 whitespace-nowrap">
                  ตำรวจภูธรจังหวัดสุราษฎร์ธานี
                </p>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
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
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl bg-white/15 -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right: User + Logout ── */}
            <div className="flex items-center gap-2">
              {/* User info — hidden on mobile */}
              <div className="hidden sm:flex flex-col items-end text-right leading-none mr-1">
                <span className="text-sm font-semibold text-white/95 truncate max-w-[180px] whitespace-nowrap">
                  {user.rank ? `${user.rank} ` : ""}{user.full_name}
                </span>
                <span className="text-xs text-white/55 mt-0.5 truncate max-w-[180px] whitespace-nowrap">
                  {user.unit}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10
                           rounded-xl text-sm font-medium transition-all border border-white/0 hover:border-white/20 whitespace-nowrap"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Desktop active-page underline indicator ── */}
        <div className="hidden md:block h-px bg-white/10" />
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 z-40 w-72 oxblood-gradient shadow-2xl md:hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">AI POLICE</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-white/70 hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User profile card */}
              <div className="mx-4 mt-4 bg-white/10 rounded-2xl p-4 border border-white/15">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-white leading-tight">
                      {user.rank ? `${user.rank} ` : ""}{user.full_name}
                    </p>
                    <p className="text-sm text-white/60 mt-0.5 truncate">{user.unit}</p>
                  </div>
                </div>
              </div>

              {/* Nav links */}
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {links.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                        active
                          ? "bg-white/20 text-white font-semibold"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                             border border-white/20 text-white/80 text-base font-medium
                             hover:bg-white/10 hover:text-white transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  ออกจากระบบ
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom Mobile Tab Bar (replaces old one) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-100 shadow-xl shadow-black/10">
        <div className="flex items-stretch">
          {links.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1.5 text-xs font-medium transition-colors ${
                  active ? "text-[#661D27]" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <div className={`p-2 rounded-lg transition-all ${active ? "bg-[#661D27]/10" : ""}`}>
                  <Icon className={`${active ? "text-[#661D27]" : ""}`} style={{ width: 22, height: 22 }} />
                </div>
                <span className={`whitespace-nowrap leading-none ${active ? "text-[#661D27] font-semibold" : ""}`}>
                  {label.length > 6 ? label.slice(0, 6) + "…" : label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
