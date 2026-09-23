"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import { exportSubmissionsToCSV } from "@/lib/export-csv";
import {
  Users,
  Send,
  BookOpen,
  Newspaper,
  Download,
  BarChart2,
  TrendingUp,
  PieChart as PieChartIcon,
  Building,
  ImageIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

const PIE_COLORS = ["#661D27", "#E8C4C8"];
const BAR_COLORS = ["#7a2130", "#9B3545", "#B5505F", "#C97080"];

// Custom tooltip style
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3.5 py-2.5 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1">{payload[0]?.payload?.fullTitle || label}</p>
      <p className="text-[#661D27] font-bold">{payload[0]?.value} งาน</p>
    </div>
  );
};

const card = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

export default function AdminDashboardPage() {
  const { user, submissions, lessons, news } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
    else if (user.role !== "admin") router.push("/dashboard");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  // ─── Derived Stats ───────────────────────────────────
  const uniqueOfficersCount = useMemo(() => {
    return new Set(submissions.map((s) => s.officer_id)).size;
  }, [submissions]);

  const submissionsByLesson = useMemo(() =>
    lessons.map((lesson) => ({
      name: lesson.title.replace(/^\d+\.\s*/, "").split(" ").slice(0, 2).join(" "),
      fullTitle: lesson.title,
      count: submissions.filter((s) => s.lesson_id === lesson.id).length,
    })),
    [lessons, submissions]
  );

  const dailyTrend = useMemo(() => {
    const map: Record<string, number> = {};
    submissions.forEach((sub) => {
      const d = new Date(sub.created_at).toLocaleDateString("th-TH", { month: "short", day: "numeric" });
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }, [submissions]);

  const topStations = useMemo(() => {
    const counts: Record<string, number> = {};
    submissions.forEach((s) => { const u = s.officer_unit || "ไม่ระบุ"; counts[u] = (counts[u] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [submissions]);

  const attachmentData = useMemo(() => {
    const withImg = submissions.filter((s) => !!s.image_url).length;
    return [
      { name: "มีภาพแนบ",    value: withImg },
      { name: "ไม่มีภาพแนบ", value: submissions.length - withImg },
    ];
  }, [submissions]);

  const attachPct = submissions.length
    ? Math.round((attachmentData[0].value / submissions.length) * 100)
    : 0;

  const handleDownloadCSV = () =>
    exportSubmissionsToCSV(submissions, `ai_police_submissions_${Date.now()}.csv`);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4F2]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 space-y-8">

        {/* ── Page Header ── */}
        <motion.div
          {...card(0)}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[11px] font-bold mb-2 tracking-wide uppercase">
              <BarChart2 className="w-3 h-3" />
              Admin Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              สถิติผลการอบรม AI POLICE
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              วิเคราะห์ข้อมูลการส่งงานของข้าราชการตำรวจ 19 สภ. จังหวัดสุราษฎร์ธานี
            </p>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-5 py-3 oxblood-gradient text-white text-sm font-bold
                       rounded-2xl shadow-lg shadow-red-950/20 hover:shadow-xl hover:shadow-red-950/30
                       hover:-translate-y-0.5 transition-all group w-fit shrink-0"
          >
            <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            ดาวน์โหลด CSV
          </button>
        </motion.div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="ผู้เข้าอบรมที่ส่งงาน"
            value={uniqueOfficersCount}
            subtitle="Unique Officers"
            icon={Users}
            colorBg="bg-blue-50"
            colorText="text-blue-600"
            delay={0.05}
          />
          <StatCard
            title="งานที่ส่งทั้งหมด"
            value={submissions.length}
            subtitle="รายการพรอมต์"
            icon={Send}
            colorBg="bg-[#661D27]/10"
            colorText="text-[#661D27]"
            delay={0.1}
          />
          <StatCard
            title="บทเรียน"
            value={lessons.length}
            subtitle="หัวข้อฝึกเขียนพรอมต์"
            icon={BookOpen}
            colorBg="bg-amber-50"
            colorText="text-amber-600"
            delay={0.15}
          />
          <StatCard
            title="ประกาศ / ข่าวสาร"
            value={news.length}
            subtitle="รายการในระบบ"
            icon={Newspaper}
            colorBg="bg-emerald-50"
            colorText="text-emerald-600"
            delay={0.2}
          />
        </div>

        {/* ── Charts Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Chart 1: Bar — by Lesson */}
          <motion.div {...card(0.1)} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-[#661D27]/10 rounded-xl">
                <BarChart2 className="w-4 h-4 text-[#661D27]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight">งานที่ส่งแยกตามบทเรียน</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Bar Chart</p>
              </div>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={submissionsByLesson} margin={{ top: 4, right: 8, left: -24, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8f0f1" }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {submissionsByLesson.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 2: Line — Daily Trend */}
          <motion.div {...card(0.15)} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-blue-50 rounded-xl">
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight">แนวโน้มการส่งงานรายวัน</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Line Chart</p>
              </div>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend} margin={{ top: 4, right: 8, left: -24, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0" }} />
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#661D27" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#661D27" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#661D27"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#661D27", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#661D27" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 3: Horizontal Bar — Top Stations */}
          <motion.div {...card(0.2)} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-amber-50 rounded-xl">
                <Building className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight">Top 8 หน่วยงานที่ส่งงาน</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Horizontal Bar</p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topStations}
                  margin={{ top: 4, right: 16, left: 48, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} width={110} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8f0f1" }} />
                  <Bar dataKey="count" fill="#8B2835" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 4: Donut + inline stat */}
          <motion.div {...card(0.25)} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight">สัดส่วนภาพแนบในงานที่ส่ง</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Donut Chart</p>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-6">
              <div className="h-56 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attachmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {attachmentData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => [`${val} รายการ`, "จำนวน"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="space-y-4 shrink-0">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-[#661D27]">{attachPct}%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">แนบภาพแล้ว</div>
                </div>
                {attachmentData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: PIE_COLORS[i] }}
                    />
                    <span className="text-slate-600">{d.name}</span>
                    <span className="font-bold text-slate-800 ml-auto pl-3">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
