import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/landing/hero-section";
import { Ticker } from "@/components/landing/ticker";
import { FeaturedCompanies } from "@/components/landing/featured-companies";
import { HowItWorks } from "@/components/landing/how-it-works";
import { UpcomingEvents } from "@/components/landing/upcoming-events";
import { NewsletterCta } from "@/components/landing/newsletter-cta";
import { ForCompaniesCta } from "@/components/landing/for-companies-cta";
import { LatestJobs } from "@/components/landing/latest-jobs";
import { Divider } from "@/components/shared/divider";
import type { CompanyCardData } from "@/components/shared/company-card";
import type { EventCardData } from "@/components/shared/event-card";
import type { JobCardData } from "@/components/jobs/job-card";

async function getFeaturedCompanies(): Promise<CompanyCardData[]> {
  // First try to get featured companies
  let companies = await prisma.company.findMany({
    where: { featured: true },
    take: 6,
    include: {
      _count: {
        select: {
          followers: true,
          jobs: true,
        },
      },
    },
  });

  // Fallback to first 6 companies if none are featured
  if (companies.length === 0) {
    companies = await prisma.company.findMany({
      take: 6,
      include: {
        _count: {
          select: {
            followers: true,
            jobs: true,
          },
        },
      },
    });
  }

  return companies.map((c) => ({
    name: c.name,
    slug: c.slug,
    industry: c.industry,
    logo: c.logo,
    locations: c.locations,
    status: c.status,
    followerCount: c._count.followers,
    jobCount: c._count.jobs,
    founded: c.founded ?? undefined,
    technologies: c.technologies ?? undefined,
    size: c.size ?? undefined,
  }));
}

async function getLatestJobs(): Promise<JobCardData[]> {
  const jobs = await prisma.jobListing.findMany({
    take: 6,
    orderBy: { postedAt: "desc" },
    include: {
      company: {
        select: { id: true, name: true, slug: true, logo: true, industry: true },
      },
    },
  });

  return jobs.map((j) => ({
    id: j.id,
    title: j.title,
    location: j.location,
    type: j.type,
    externalUrl: j.externalUrl,
    postedAt: j.postedAt.toISOString(),
    company: j.company,
  }));
}

async function getUpcomingEvents(): Promise<EventCardData[]> {
  const now = new Date();
  const events = await prisma.event.findMany({
    where: {
      date: { gte: now },
    },
    orderBy: { date: "asc" },
    take: 3,
    include: {
      company: {
        select: { name: true },
      },
    },
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type,
    date: e.date,
    startTime: e.startTime,
    location: e.location,
    isOnline: e.isOnline,
    registrationUrl: e.registrationUrl,
    company: e.company,
  }));
}

async function getStats() {
  const [companyCount, eventCount, jobCount, allCompanies] = await Promise.all([
    prisma.company.count(),
    prisma.event.count(),
    prisma.jobListing.count({ where: { status: "ACTIVE" } }),
    prisma.company.findMany({
      select: { industry: true, technologies: true, locations: true },
    }),
  ]);

  // Distinct industries
  const industries = [...new Set(allCompanies.map((c) => c.industry))];

  // Technologies + locations for ticker row 2
  const techSet = new Set<string>();
  const locSet = new Set<string>();
  for (const c of allCompanies) {
    // technologies is a string (comma-separated or JSON array)
    if (c.technologies) {
      try {
        const parsed = JSON.parse(c.technologies);
        if (Array.isArray(parsed)) parsed.forEach((t: string) => techSet.add(t));
      } catch {
        c.technologies.split(",").forEach((t) => techSet.add(t.trim()));
      }
    }
    // locations is a JSON string array
    if (c.locations) {
      try {
        const parsed = JSON.parse(c.locations);
        if (Array.isArray(parsed)) parsed.forEach((l: string) => locSet.add(l));
      } catch {
        locSet.add(c.locations);
      }
    }
  }

  return {
    companies: companyCount,
    candidates: 500,
    openRoles: jobCount,
    events: eventCount,
    sectors: industries.length,
    industries,
    techAndLocations: [...techSet, ...locSet],
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [companies, events, stats, latestJobs] = await Promise.all([
    getFeaturedCompanies(),
    getUpcomingEvents(),
    getStats(),
    getLatestJobs(),
  ]);

  return (
    <div className="flex flex-col">
      <HeroSection stats={stats} />
      <Ticker industries={stats.industries} techAndLocations={stats.techAndLocations} />
      <HowItWorks />
      <FeaturedCompanies companies={companies} />
      <Divider />
      <LatestJobs jobs={latestJobs} />
      <Divider />
      <UpcomingEvents events={events} />
      <ForCompaniesCta />
      <NewsletterCta />
    </div>
  );
}
