import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { JobsClient } from "@/components/jobs/jobs-client";
import type { JobCardData } from "@/components/jobs/job-card";

async function getActiveJobs(): Promise<{ jobs: JobCardData[]; total: number }> {
  const where = { status: "ACTIVE" as const };

  const [jobs, total] = await Promise.all([
    prisma.jobListing.findMany({
      where,
      orderBy: { postedAt: "desc" },
      take: 20,
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
    }),
    prisma.jobListing.count({ where }),
  ]);

  const mapped: JobCardData[] = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    location: j.location,
    type: j.type,
    externalUrl: j.externalUrl,
    postedAt: j.postedAt.toISOString(),
    company: {
      id: j.company.id,
      name: j.company.name,
      slug: j.company.slug,
      logo: j.company.logo,
      industry: j.company.industry,
    },
  }));

  return { jobs: mapped, total };
}

export default async function JobsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { jobs, total } = await getActiveJobs();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <JobsClient initialJobs={jobs} initialTotal={total} />
    </div>
  );
}
