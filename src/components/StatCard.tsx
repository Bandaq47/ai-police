import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorBg?: string;
  colorText?: string;
  trend?: number; // optional % change
  delay?: number;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorBg = "bg-[#661D27]/10",
  colorText = "text-[#661D27]",
  trend,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start justify-between oxblood-card-hover stat-shimmer group cursor-default"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
          {title}
        </p>
        <h3 className="text-3xl font-extrabold text-slate-900 leading-none tabular-nums">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1.5 leading-snug">{subtitle}</p>
        )}
        {trend !== undefined && (
          <p
            className={`text-[11px] font-semibold mt-2 flex items-center gap-1 ${
              trend >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            <span>{trend >= 0 ? "▲" : "▼"}</span>
            <span>{Math.abs(trend)}% จากเมื่อวาน</span>
          </p>
        )}
      </div>

      <div
        className={`p-3.5 rounded-xl ${colorBg} ${colorText} shrink-0 ml-4
                    group-hover:scale-110 transition-transform duration-200`}
      >
        <Icon className="w-6 h-6" />
      </div>
    </motion.div>
  );
}
