"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatsCard({
  icon: Icon,
  value,
  label,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
          <Icon className="size-5 text-white/40" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl font-bold text-primary">
            {value.toLocaleString()}
          </p>
          <p className="text-xs text-white/30 mt-1">{label}</p>
        </div>
        {trend && (
          <div
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
              trend.positive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            )}
          >
            {trend.positive ? "+" : ""}
            {trend.value}%
          </div>
        )}
      </div>
    </div>
  );
}
