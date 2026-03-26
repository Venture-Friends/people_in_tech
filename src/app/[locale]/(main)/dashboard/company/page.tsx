import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { getCompanyForUser } from "@/lib/company-helpers";
import { CompanyDashboardClient } from "@/components/dashboard/company/dashboard-client";

export default async function CompanyDashboardPage({
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

  if (session.user.role !== "COMPANY_REP") {
    redirect(`/${locale}`);
  }

  const company = await getCompanyForUser(session.user.id);

  if (!company) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          No Access
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          You do not have an approved company claim. Please submit a claim for
          your company profile and wait for admin approval before accessing the
          dashboard.
        </p>
      </div>
    );
  }

  // Fetch overview stats in parallel
  const [followerCount, activeJobCount, upcomingEventCount] = await Promise.all(
    [
      prisma.follow.count({
        where: { companyId: company.id },
      }),
      prisma.jobListing.count({
        where: { companyId: company.id, status: "ACTIVE" },
      }),
      prisma.event.count({
        where: {
          companyId: company.id,
          date: { gte: new Date() },
        },
      }),
    ]
  );

  // Fetch company profile data for profile editor
  const profileData = {
    id: company.id,
    name: company.name,
    description: company.description,
    industry: company.industry,
    website: company.website,
    linkedinUrl: company.linkedinUrl,
    logo: company.logo,
    coverImage: company.coverImage,
    size: company.size,
    founded: company.founded,
    locations: company.locations,
    technologies: company.technologies,
  };

  return (
    <CompanyDashboardClient
      followerCount={followerCount}
      activeJobCount={activeJobCount}
      upcomingEventCount={upcomingEventCount}
      profileData={profileData}
    />
  );
}
