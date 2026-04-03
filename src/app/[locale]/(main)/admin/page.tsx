import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

export default async function AdminPage({
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

  if (session.user.role !== "ADMIN") {
    redirect(`/${locale}`);
  }

  // Fetch KPI stats
  const [totalCompanies, totalCandidates, pendingCompanyClaims, pendingVerificationClaims, activeJobs] =
    await Promise.all([
      prisma.company.count(),
      prisma.user.count({ where: { role: "CANDIDATE" } }),
      prisma.companyClaim.count({ where: { status: "PENDING" } }),
      prisma.pendingClaim.count({ where: { verified: false } }),
      prisma.jobListing.count({ where: { status: "ACTIVE" } }),
    ]);

  const pendingClaims = pendingCompanyClaims + pendingVerificationClaims;

  // Top followed companies for overview
  const topCompanies = await prisma.company.findMany({
    orderBy: { followers: { _count: "desc" } },
    take: 5,
    include: {
      _count: { select: { followers: true } },
    },
  });

  return (
    <AdminDashboardClient
      kpis={{
        totalCompanies,
        totalCandidates,
        pendingClaims,
        activeJobs,
      }}
      topCompanies={topCompanies.map((c) => ({
        id: c.id,
        name: c.name,
        followers: c._count.followers,
      }))}
    />
  );
}
