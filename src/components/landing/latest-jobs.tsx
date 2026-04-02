"use client";

import { JobCard, type JobCardData } from "@/components/jobs/job-card";
import { SectionHeader } from "@/components/shared/section-header";
import { AuthGate } from "@/components/shared/auth-gate";
import { authClient } from "@/lib/auth-client";

const ANONYMOUS_JOB_LIMIT = 3;

interface LatestJobsProps {
  jobs: JobCardData[];
}

export function LatestJobs({ jobs }: LatestJobsProps) {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  if (jobs.length === 0) return null;

  const shouldGate = !isAuthenticated && jobs.length > ANONYMOUS_JOB_LIMIT;
  const visible = shouldGate ? jobs.slice(0, ANONYMOUS_JOB_LIMIT) : jobs;

  return (
    <section className="w-full py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Latest Roles" href="/jobs" />
        <div className="flex flex-col gap-3">
          {visible.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {shouldGate && (
          <AuthGate message="Join the talent pool to discover all open roles" />
        )}
      </div>
    </section>
  );
}
