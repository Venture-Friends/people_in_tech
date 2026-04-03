import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { CompanyHero } from "@/components/company/company-hero";
import { CompanyTabs } from "@/components/company/company-tabs";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function parseJsonArray(jsonString: string): string[] {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

async function getCompany(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      jobs: {
        where: { status: "ACTIVE" },
        orderBy: { postedAt: "desc" },
      },
      events: {
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        include: {
          company: {
            select: { name: true },
          },
        },
      },
      gallery: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: { followers: true },
      },
    },
  });

  return company;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!company) {
    return { title: "Company Not Found" };
  }

  return {
    title: `${company.name} | People in Tech`,
    description: company.description?.slice(0, 160) || undefined,
  };
}

export default async function CompanyProfilePage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const company = await getCompany(slug);

  if (!company) {
    notFound();
  }

  // Fetch approved team members (company reps)
  const teamMembers = await prisma.companyClaim.findMany({
    where: { companyId: company.id, status: "APPROVED" },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  const teamData = teamMembers.map((claim) => ({
    userId: claim.user.id,
    fullName: claim.fullName,
    jobTitle: claim.jobTitle,
    avatarUrl: claim.user.avatarUrl,
  }));

  // Check if current user follows this company and has a pending claim
  let isFollowing = false;
  let userHasPendingClaim = false;
  const session = await getSession();
  if (session?.user) {
    const userId = (session.user as { id: string }).id;
    const [follow, pendingClaim] = await Promise.all([
      prisma.follow.findUnique({
        where: {
          userId_companyId: {
            userId,
            companyId: company.id,
          },
        },
      }),
      prisma.companyClaim.findFirst({
        where: {
          companyId: company.id,
          userId,
          status: "PENDING",
        },
      }),
    ]);
    isFollowing = !!follow;
    userHasPendingClaim = !!pendingClaim;
  }

  // Fetch the representative claim for display
  let representativeClaim = null;
  if (company.status === "VERIFIED" || company.status === "CLAIMED") {
    representativeClaim = await prisma.companyClaim.findFirst({
      where: {
        companyId: company.id,
        status: company.status === "VERIFIED" ? "APPROVED" : "PENDING",
      },
      orderBy: { createdAt: "desc" },
      select: {
        fullName: true,
        jobTitle: true,
        linkedinUrl: true,
        status: true,
      },
    });
  }

  const locations = parseJsonArray(company.locations);
  const technologies = parseJsonArray(company.technologies);

  const jobsData = company.jobs.map((job) => ({
    id: job.id,
    title: job.title,
    location: job.location,
    type: job.type,
    externalUrl: job.externalUrl,
    postedAt: job.postedAt.toISOString(),
  }));

  const eventsData = company.events.map((event) => ({
    id: event.id,
    title: event.title,
    type: event.type,
    date: event.date.toISOString(),
    startTime: event.startTime,
    location: event.location,
    isOnline: event.isOnline,
    company: event.company,
  }));

  const galleryData = company.gallery.map((img) => ({
    id: img.id,
    url: img.url,
    caption: img.caption,
    order: img.order,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <CompanyHero
        id={company.id}
        name={company.name}
        description={company.description}
        industry={company.industry}
        logo={company.logo}
        coverImage={company.coverImage}
        size={company.size}
        status={company.status}
        website={company.website}
        linkedinUrl={company.linkedinUrl}
        locations={locations}
        founded={company.founded}
        initialFollowed={isFollowing}
        followerCount={company._count.followers}
        userHasPendingClaim={userHasPendingClaim}
        representativeClaim={representativeClaim}
      />

      <div className="mt-8">
        <CompanyTabs
          companyName={company.name}
          description={company.description}
          technologies={technologies}
          founded={company.founded}
          size={company.size}
          locations={locations}
          industry={company.industry}
          website={company.website}
          status={company.status}
          jobs={jobsData}
          events={eventsData}
          galleryImages={galleryData}
          teamMembers={teamData}
        />
      </div>
    </div>
  );
}
