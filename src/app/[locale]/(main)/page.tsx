import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturedCompanies } from "@/components/landing/featured-companies";
import { HowItWorks } from "@/components/landing/how-it-works";
import { UpcomingEvents } from "@/components/landing/upcoming-events";
import { NewsletterCta } from "@/components/landing/newsletter-cta";
import { ForCompaniesCta } from "@/components/landing/for-companies-cta";
import type { CompanyCardData } from "@/components/shared/company-card";
import type { EventCardData } from "@/components/shared/event-card";

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
    company: e.company,
  }));
}

async function getStats() {
  const [companyCount, eventCount, industries] = await Promise.all([
    prisma.company.count(),
    prisma.event.count(),
    prisma.company.findMany({
      select: { industry: true },
      distinct: ["industry"],
    }),
  ]);

  return {
    companies: companyCount,
    candidates: 500,
    events: eventCount,
    sectors: industries.length,
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [companies, events, stats] = await Promise.all([
    getFeaturedCompanies(),
    getUpcomingEvents(),
    getStats(),
  ]);

  return (
    <div className="flex flex-col">
      <HeroSection stats={stats} />
      <FeaturedCompanies companies={companies} />
      <HowItWorks />
      <UpcomingEvents events={events} />
      <NewsletterCta />
      <ForCompaniesCta />
    </div>
  );
}
