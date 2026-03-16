"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Play, Pause, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Job {
  id: string;
  title: string;
  companyName: string;
  companySlug: string;
  location: string | null;
  type: string;
  status: string;
  postedAt: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  PAUSED: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  EXPIRED: "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30",
};

const typeLabels: Record<string, string> = {
  ONSITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const typeColors: Record<string, string> = {
  ONSITE: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  REMOTE: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  HYBRID: "bg-teal-500/20 text-teal-400 border border-teal-500/30",
};

export function JobsTable() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchJobs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/jobs?${params}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchJobs, 300);
    return () => clearTimeout(timeout);
  }, [fetchJobs]);

  const handleToggleStatus = async (job: Job) => {
    const newStatus = job.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        toast.error("Failed to update job status");
        return;
      }
      toast.success(`Job ${newStatus === "ACTIVE" ? "activated" : "paused"}`);
      fetchJobs();
    } catch {
      toast.error("Failed to update job status");
    }
  };

  const handleDelete = async (job: Job) => {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to delete job");
        return;
      }
      toast.success("Job deleted");
      fetchJobs();
    } catch {
      toast.error("Failed to delete job");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Job Listings
        </h2>
        <p className="text-sm text-white/[0.35] mt-1">
          Manage all job listings across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <Input
            placeholder="Search jobs or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v !== null && setStatusFilter(v)}>
          <SelectTrigger className="w-[160px] rounded-[14px] border-white/[0.07] bg-white/[0.03]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/[0.04] hover:bg-transparent">
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Title</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Company</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Location</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Type</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Status</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Posted</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <TableCell
                    colSpan={7}
                    className="text-center text-white/30 py-8"
                  >
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <TableCell className="font-medium text-[13px]">{job.title}</TableCell>
                    <TableCell className="text-[13px]">{job.companyName}</TableCell>
                    <TableCell className="text-[13px] text-white/[0.35]">
                      {job.location || "N/A"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          typeColors[job.type] || "bg-white/[0.05] text-white/30"
                        }`}
                      >
                        {typeLabels[job.type] || job.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          statusColors[job.status] || "bg-white/[0.05] text-white/30"
                        }`}
                      >
                        {job.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-[13px] text-white/[0.35]">
                      {new Date(job.postedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-white/30 hover:text-white/60"
                          onClick={() => handleToggleStatus(job)}
                          title={
                            job.status === "ACTIVE" ? "Pause" : "Activate"
                          }
                        >
                          {job.status === "ACTIVE" ? (
                            <Pause className="size-3.5" />
                          ) : (
                            <Play className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-400/60 hover:text-red-400"
                          onClick={() => handleDelete(job)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
