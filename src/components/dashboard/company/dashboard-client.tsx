"use client";

import { useSearchParams } from "next/navigation";
import { OverviewClient } from "./overview";
import { ProfileEditor } from "./profile-editor";
import { JobManager } from "./job-manager";
import { EventManager } from "./event-manager";
import { GalleryManager } from "./gallery-manager";
import { Analytics } from "./analytics";

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
      {activeTab === "gallery" && <GalleryManager />}
      {activeTab === "analytics" && <Analytics />}
    </div>
  );
}
