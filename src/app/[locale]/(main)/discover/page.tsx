import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { DiscoverClient } from "@/components/discover/discover-client";
import type { CompanyCardData } from "@/components/shared/company-card";

async function getInitialCompanies(): Promise<{
  companies: CompanyCardData[];
  total: number;
}> {
  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      orderBy: [{ featured: "desc" }, { followers: { _count: "desc" } }],
      take: 20,
      include: {
        _count: {
          select: {
            followers: true,
            jobs: {
              where: { status: "ACTIVE" },
            },
          },
        },
        claims: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { fullName: true, jobTitle: true },
        },
      },
    }),
    prisma.company.count(),
  ]);

  const mapped = companies.map((c) => ({
    name: c.name,
    slug: c.slug,
    industry: c.industry,
    logo: c.logo,
    locations: c.locations,
    status: c.status,
    featured: c.featured,
    followerCount: c._count.followers,
    jobCount: c._count.jobs,
    representative: c.claims[0]
      ? { name: c.claims[0].fullName, title: c.claims[0].jobTitle }
      : null,
  }));

  return { companies: mapped, total };
}

export default async function DiscoverPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [{ companies, total }, distinctIndustries] = await Promise.all([
    getInitialCompanies(),
    prisma.company
      .findMany({ select: { industry: true }, distinct: ["industry"], orderBy: { industry: "asc" } })
      .then((rows) => rows.map((r) => r.industry)),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DiscoverClient initialCompanies={companies} initialTotal={total} industries={distinctIndustries} />
    </div>
  );
}
