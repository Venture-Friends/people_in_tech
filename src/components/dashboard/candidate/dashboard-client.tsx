"use client";

import { useState } from "react";
import { FollowedCompanies } from "./followed-companies";
import { SavedJobs, type SavedJobData } from "./saved-jobs";
import { AlertsTab, type AlertItem } from "./alerts-tab";
import { SavedEventsTab, type SavedEventData } from "./saved-events-tab";
import { type CompanyCardData } from "@/components/shared/company-card";
import { Heart, Bookmark, Bell, Calendar, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

interface DashboardClientProps {
  companies: (CompanyCardData & { id: string })[];
  savedJobs: SavedJobData[];
  alerts?: AlertItem[];
  savedEvents?: SavedEventData[];
  userName?: string;
  alertsCount?: number;
  savedEventsCount?: number;
}

const TABS = [
  { value: "following", label: "Saved Companies", icon: Heart },
  { value: "saved-jobs", label: "Saved Jobs", icon: Bookmark },
  { value: "alerts", label: "Alerts", icon: Bell },
  { value: "saved-events", label: "Saved Events", icon: Calendar },
] as const;

export function DashboardClient({
  companies,
  savedJobs,
  alerts: initialAlerts = [],
  savedEvents = [],
  userName,
  alertsCount = 0,
  savedEventsCount = 0,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState("following");
  const [alerts, setAlerts] = useState(initialAlerts);
  const [localAlertsCount, setLocalAlertsCount] = useState(alertsCount);

  async function handleMarkAllRead() {
    try {
      const res = await fetch("/api/candidate/alerts/read", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to mark alerts as read");
      setAlerts((prev) => prev.map((a) => ({ ...a, isNew: false })));
      setLocalAlertsCount(0);
    } catch {
      // Silently fail, the UI still shows the alerts
    }
  }

  return (
    <div>
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[42px] font-bold tracking-[-0.03em] text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-[15px] text-white/[0.35]">{userName ? `Welcome back, ${userName}` : "Welcome back"}</p>
        </div>
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <Pencil className="size-4" />
          Edit Profile
        </Link>
      </div>

      {/* Stats row */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <div className="font-display text-2xl font-bold text-primary">
            {companies.length}
          </div>
          <div className="text-xs text-white/30 mt-1">Saved Companies</div>
        </div>
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <div className="font-display text-2xl font-bold text-primary">
            {savedJobs.length}
          </div>
          <div className="text-xs text-white/30 mt-1">Saved Jobs</div>
        </div>
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <div className="font-display text-2xl font-bold text-primary">
            {localAlertsCount}
          </div>
          <div className="text-xs text-white/30 mt-1">New Alerts</div>
        </div>
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <div className="font-display text-2xl font-bold text-primary">
            {savedEventsCount}
          </div>
          <div className="text-xs text-white/30 mt-1">Saved Events</div>
        </div>
      </div>

      {/* Custom tab bar */}
      <div className="mt-10 flex gap-6 border-b border-white/[0.04] mb-8 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex items-center gap-1.5 pb-3 text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer",
                isActive
                  ? "text-primary border-b-2 border-primary"
                  : "text-white/40 hover:text-white/60"
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "following" && (
        <FollowedCompanies companies={companies} />
      )}

      {activeTab === "saved-jobs" && (
        <SavedJobs jobs={savedJobs} />
      )}

      {activeTab === "alerts" && (
        <AlertsTab alerts={alerts} onMarkAllRead={handleMarkAllRead} />
      )}

      {activeTab === "saved-events" && (
        <SavedEventsTab events={savedEvents} />
      )}
    </div>
  );
}
