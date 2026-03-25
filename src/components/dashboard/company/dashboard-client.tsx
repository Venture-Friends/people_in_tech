"use client";

import { useSearchParams } from "next/navigation";
import { OverviewClient } from "./overview";
import { ProfileEditor } from "./profile-editor";
import { JobManager } from "./job-manager";
import { EventManager } from "./event-manager";
import { TrendingUp, Clock } from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  description: string | null;
  industry: string;
  website: string | null;
  linkedinUrl: string | null;
  logo: string | null;
  coverImage: string | null;
  size: string;
  founded: number | null;
  locations: string;
  technologies: string;
}

interface CompanyDashboardClientProps {
  followerCount: number;
  activeJobCount: number;
  upcomingEventCount: number;
  profileData: ProfileData;
}

function ComingSoonCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-12 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06]">
        <Icon className="size-7 text-emerald-400" />
      </div>
      <div className="mb-2 flex items-center justify-center gap-2">
        <Clock className="size-3.5 text-white/30" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">
          Coming Soon
        </span>
      </div>
      <h3 className="font-display text-xl font-semibold text-white mb-2">
        {title}
      </h3>
      <p className="mx-auto max-w-md text-[13px] leading-relaxed text-white/[0.35]">
        {description}
      </p>
    </div>
  );
}

export function CompanyDashboardClient({
  followerCount,
  activeJobCount,
  upcomingEventCount,
  profileData,
}: CompanyDashboardClientProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  return (
    <div>
      {activeTab === "overview" && (
        <OverviewClient
          followerCount={followerCount}
          activeJobCount={activeJobCount}
          upcomingEventCount={upcomingEventCount}
        />
      )}
      {activeTab === "profile" && (
        <ProfileEditor initialData={profileData} />
      )}
      {activeTab === "jobs" && <JobManager />}
      {activeTab === "events" && <EventManager />}
      {activeTab === "analytics" && (
        <ComingSoonCard
          icon={TrendingUp}
          title="Analytics"
          description="Track profile views, follower growth, job listing performance, and audience demographics. Analytics will be available once your company profile has enough activity."
        />
      )}
    </div>
  );
}
