import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  flat?: boolean;
  padded?: boolean;
}

export function GlassCard({
  children,
  className,
  flat,
  padded = true,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        flat
          ? "bg-white border border-slate-200 rounded-xl shadow-xs"
          : "bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200",
        padded && "p-5 md:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
