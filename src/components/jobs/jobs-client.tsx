"use client";

import { useState, useEffect, useCallback } from "react";
import { JobCard, type JobCardData } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

interface JobsClientProps {
  initialJobs: JobCardData[];
  initialTotal: number;
}

export function JobsClient({ initialJobs, initialTotal }: JobsClientProps) {
  const [jobs, setJobs] = useState<JobCardData[]>(initialJobs);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [sort, setSort] = useState("newest");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (type !== "ALL") params.set("type", type);
      params.set("sort", sort);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setJobs(data.jobs);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [search, type, sort]);

  useEffect(() => {
    // Debounce search, immediate for other filters
    const timer = setTimeout(() => {
      fetchJobs();
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [fetchJobs, search]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Open Roles" subtitle="Find your next opportunity in Greek tech" />

      <JobFilters
        search={search}
        onSearchChange={setSearch}
        type={type}
        onTypeChange={setType}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Results count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Briefcase className="size-4" />
        <span>
          {total} {total === 1 ? "role" : "roles"} found
        </span>
      </div>

      {/* Job list */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Briefcase className="size-12 text-muted-foreground/40" />
          <p className="text-lg font-semibold text-foreground">
            No roles found
          </p>
          <p className="text-sm text-muted-foreground">
            Try different filters or search terms
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
