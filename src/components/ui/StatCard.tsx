import type { ReactNode } from "react";
import { Skeleton } from "antd";
import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: string;
  loading?: boolean;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  trendPositive,
  accentColor = "bg-primary/10 text-primary",
  loading,
  onClick,
}: StatCardProps) {
  if (loading) {
    return (
      <GlassCard className="p-5">
        <Skeleton active paragraph={{ rows: 2 }} />
      </GlassCard>
    );
  }

  return (
    <GlassCard
      onClick={onClick}
      className={cn(
        "p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-200 hover:-translate-y-0.5",
        onClick && "hover:border-primary/40"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-transform duration-200 group-hover:scale-110",
            accentColor
          )}
        >
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {trend && (
            <span
              className={cn(
                "font-semibold px-2 py-0.5 rounded-full text-[11px]",
                trendPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              )}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
}
