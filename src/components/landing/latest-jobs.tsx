"use client";

import { Link } from "@/i18n/navigation";
import { JobCard, type JobCardData } from "@/components/jobs/job-card";
import { SectionHeader } from "@/components/shared/section-header";

interface LatestJobsProps {
  jobs: JobCardData[];
}

export function LatestJobs({ jobs }: LatestJobsProps) {
  if (jobs.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Latest Jobs" href="/jobs" />
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}
