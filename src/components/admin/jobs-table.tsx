"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Play, Pause, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  ACTIVE: "bg-emerald-500/20 text-emerald-400",
  PAUSED: "bg-amber-500/20 text-amber-400",
  EXPIRED: "bg-gray-500/20 text-gray-400",
};

const typeLabels: Record<string, string> = {
  ONSITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
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
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Job Listings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all job listings across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v !== null && setStatusFilter(v)}>
          <SelectTrigger className="w-[160px]">
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.companyName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {job.location || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {typeLabels[job.type] || job.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusColors[job.status] ||
                        "bg-muted text-muted-foreground"
                      }
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(job.postedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
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
                        className="text-red-400 hover:text-red-300"
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
      )}
    </div>
  );
}
