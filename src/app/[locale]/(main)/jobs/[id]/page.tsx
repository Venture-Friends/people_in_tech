import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { JobDetail } from "@/components/jobs/job-detail";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const job = await prisma.jobListing.findUnique({
    where: { id },
    include: {
      company: {
        include: {
          _count: {
            select: { jobs: true },
          },
        },
      },
    },
  });

  if (!job) {
    notFound();
  }

  // Get more jobs from same company
  const moreJobs = await prisma.jobListing.findMany({
    where: {
      companyId: job.companyId,
      id: { not: job.id },
    },
    take: 3,
    include: {
      company: {
        select: { id: true, name: true, slug: true, logo: true, industry: true },
      },
    },
  });

  return (
    <JobDetail
      job={{
        id: job.id,
        title: job.title,
        location: job.location,
        type: job.type,
        externalUrl: job.externalUrl,
        postedAt: job.postedAt.toISOString(),
      }}
      company={{
        id: job.company.id,
        name: job.company.name,
        slug: job.company.slug,
        logo: job.company.logo,
        industry: job.company.industry,
        website: job.company.website,
        locations: job.company.locations,
        technologies: job.company.technologies,
        size: job.company.size,
        jobCount: job.company._count.jobs,
      }}
      moreJobs={moreJobs.map((j) => ({
        id: j.id,
        title: j.title,
        location: j.location,
        type: j.type,
        externalUrl: j.externalUrl,
        postedAt: j.postedAt.toISOString(),
        company: j.company,
      }))}
    />
  );
}
