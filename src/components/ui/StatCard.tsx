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
        "p-5 flex flex-col justify-between",
        onClick && "cursor-pointer hover:border-stone-300"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-stone-500 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-semibold text-stone-900 tracking-tight tabular-nums">
            {value}
          </h3>
        </div>
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center text-base",
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
