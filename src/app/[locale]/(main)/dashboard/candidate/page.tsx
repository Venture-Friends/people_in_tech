import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { getActiveContext } from "@/lib/context";
import { DashboardClient } from "@/components/dashboard/candidate/dashboard-client";
import type { CompanyCardData } from "@/components/shared/company-card";
import type { SavedJobData } from "@/components/dashboard/candidate/saved-jobs";
import type { ProfileData } from "@/components/dashboard/candidate/profile-settings";
import type { AlertItem } from "@/components/dashboard/candidate/alerts-tab";
import type { SavedEventData } from "@/components/dashboard/candidate/saved-events-tab";

export default async function CandidateDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const role = session.user.role;
  if (role !== "CANDIDATE" && role !== "COMPANY_REP") {
    redirect(`/${locale}`);
  }

  // COMPANY_REP users must be in "personal" context to view this dashboard
  if (role === "COMPANY_REP") {
    const activeContext = await getActiveContext();
    if (activeContext !== "personal") {
      redirect(`/${locale}/dashboard/company`);
    }
  }

  const userId = session.user.id;

  // Fetch all data in parallel
  const [user, candidateProfile, follows, savedJobs, savedEventsRaw] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    }),
    prisma.candidateProfile.findUnique({
      where: { userId },
    }),
    prisma.follow.findMany({
      where: { userId },
      include: {
        company: {
          include: {
            _count: {
              select: {
                followers: true,
                jobs: {
                  where: { status: "ACTIVE" },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                industry: true,
              },
            },
          },
        },
      },
      orderBy: { savedAt: "desc" },
    }),
    prisma.savedEvent.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { savedAt: "desc" },
    }),
  ]);

  // Map followed companies to CompanyCardData format
  const companies: (CompanyCardData & { id: string })[] = follows.map((f) => ({
    id: f.company.id,
    name: f.company.name,
    slug: f.company.slug,
    industry: f.company.industry,
    logo: f.company.logo,
    locations: f.company.locations,
    status: f.company.status,
    followerCount: f.company._count.followers,
    jobCount: f.company._count.jobs,
  }));

  // Map saved jobs to SavedJobData format
  const savedJobsData: SavedJobData[] = savedJobs.map((s) => ({
    id: s.job.id,
    title: s.job.title,
    location: s.job.location,
    type: s.job.type,
    externalUrl: s.job.externalUrl,
    postedAt: s.job.postedAt.toISOString(),
    company: {
      id: s.job.company.id,
      name: s.job.company.name,
      slug: s.job.company.slug,
      logo: s.job.company.logo,
      industry: s.job.company.industry,
    },
  }));

  // Map saved events to SavedEventData format
  const savedEventsData: SavedEventData[] = savedEventsRaw.map((s) => ({
    id: s.id,
    eventId: s.event.id,
    title: s.event.title,
    type: s.event.type,
    date: s.event.date.toISOString(),
    startTime: s.event.startTime,
    location: s.event.location,
    isOnline: s.event.isOnline,
    companyName: s.event.company?.name || "Community",
    companySlug: s.event.company?.slug || "",
  }));

  // Build alerts from followed companies' recent jobs and events
  const lastSeenAlertsAt = candidateProfile?.lastSeenAlertsAt;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const alertCutoff = lastSeenAlertsAt || thirtyDaysAgo;

  const followedCompanyIds = follows.map((f) => f.companyId);

  let alerts: AlertItem[] = [];
  let alertsCount = 0;

  if (followedCompanyIds.length > 0) {
    const [recentJobs, recentEvents] = await Promise.all([
      prisma.jobListing.findMany({
        where: {
          companyId: { in: followedCompanyIds },
          postedAt: { gte: thirtyDaysAgo },
          status: "ACTIVE",
        },
        include: {
          company: {
            select: { name: true, slug: true },
          },
        },
        orderBy: { postedAt: "desc" },
        take: 50,
      }),
      prisma.event.findMany({
        where: {
          companyId: { in: followedCompanyIds },
          createdAt: { gte: thirtyDaysAgo },
        },
        include: {
          company: {
            select: { name: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const jobAlerts: AlertItem[] = recentJobs.map((job) => ({
      id: `job-${job.id}`,
      type: "job" as const,
      title: job.title,
      companyName: job.company.name,
      companySlug: job.company.slug,
      date: job.postedAt.toISOString(),
      isNew: job.postedAt > alertCutoff,
      linkUrl: `/jobs/${job.id}`,
    }));

    const eventAlerts: AlertItem[] = recentEvents.map((event) => ({
      id: `event-${event.id}`,
      type: "event" as const,
      title: event.title,
      companyName: event.company?.name || "Community",
      companySlug: event.company?.slug || "",
      date: event.createdAt.toISOString(),
      isNew: event.createdAt > alertCutoff,
      linkUrl: event.company?.slug ? `/companies/${event.company.slug}` : "/events",
    }));

    alerts = [...jobAlerts, ...eventAlerts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    alertsCount = alerts.filter((a) => a.isNew).length;
  }

  // Build profile data
  const profile: ProfileData = {
    name: user?.name || "",
    headline: candidateProfile?.headline || "",
    linkedinUrl: candidateProfile?.linkedinUrl || "",
    experienceLevel: candidateProfile?.experienceLevel || "STUDENT",
    skills: candidateProfile ? JSON.parse(candidateProfile.skills) : [],
    roleInterests: candidateProfile ? JSON.parse(candidateProfile.roleInterests) : [],
    industries: candidateProfile ? JSON.parse(candidateProfile.industries) : [],
    preferredLocations: candidateProfile ? JSON.parse(candidateProfile.preferredLocations) : [],
    emailDigest: candidateProfile?.emailDigest ?? true,
    emailEvents: candidateProfile?.emailEvents ?? true,
    emailNewsletter: candidateProfile?.emailNewsletter ?? false,
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <DashboardClient
        companies={companies}
        savedJobs={savedJobsData}
        profile={profile}
        alerts={alerts}
        savedEvents={savedEventsData}
        userName={user?.name || undefined}
        alertsCount={alertsCount}
        savedEventsCount={savedEventsData.length}
      />
    </div>
  );
}
