"use client";

import { Link } from "@/i18n/navigation";
import { Bell } from "lucide-react";

export interface AlertItem {
  id: string;
  type: "job" | "event";
  title: string;
  companyName: string;
  companySlug: string;
  date: string;
  isNew: boolean;
  linkUrl: string;
}

interface AlertsTabProps {
  alerts: AlertItem[];
  onMarkAllRead: () => void;
}

function getRelativeTime(date: string): string {
  const alertDate = new Date(date);
  const days = Math.floor((Date.now() - alertDate.getTime()) / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export function AlertsTab({ alerts, onMarkAllRead }: AlertsTabProps) {
  const hasNew = alerts.some((a) => a.isNew);

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-12 text-center">
        <Bell className="size-12 text-white/20 mb-4" />
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
          No alerts yet
        </h3>
        <p className="text-[14px] text-white/[0.35]">
          Follow companies to get notified about new jobs and events.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with mark all read */}
      {hasNew && (
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* Activity feed */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4"
          >
            {/* Status dot */}
            <div className="shrink-0">
              <div
                className={`w-2 h-2 rounded-full ${
                  alert.isNew ? "bg-primary" : "bg-white/20"
                }`}
              />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">
                <Link
                  href={`/companies/${alert.companySlug}`}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  {alert.companyName}
                </Link>
                {alert.type === "job"
                  ? " posted a new role: "
                  : " is hosting: "}
                <span className="font-medium">{alert.title}</span>
              </p>
              <p className="text-xs text-white/30 mt-1">
                {getRelativeTime(alert.date)}
              </p>
            </div>

            {/* View link */}
            <Link
              href={alert.linkUrl}
              className="shrink-0 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
