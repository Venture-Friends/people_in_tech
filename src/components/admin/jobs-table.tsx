"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Play, Pause, Trash2, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface CompanyOption {
  id: string;
  name: string;
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

const initialJobForm = {
  title: "",
  companyId: "",
  description: "",
  location: "",
  type: "ONSITE",
  externalUrl: "",
};

export function JobsTable() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [jobForm, setJobForm] = useState(initialJobForm);
  const [submitting, setSubmitting] = useState(false);

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

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/companies");
      const data = await res.json();
      const list = (data.companies || []).map((c: { id: string; name: string }) => ({
        id: c.id,
        name: c.name,
      }));
      setCompanies(list);
    } catch {
      // Silently fail — companies will be empty
    }
  }, []);

  useEffect(() => {
    if (addDialogOpen && companies.length === 0) {
      fetchCompanies();
    }
  }, [addDialogOpen, companies.length, fetchCompanies]);

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

  const handleAddJob = async () => {
    if (!jobForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!jobForm.companyId) {
      toast.error("Please select a company");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobForm),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create job");
        return;
      }

      toast.success("Job created successfully");
      setAddDialogOpen(false);
      setJobForm(initialJobForm);
      fetchJobs();
    } catch {
      toast.error("Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Job Listings
          </h2>
          <p className="text-sm text-white/[0.35] mt-1">
            Manage all job listings across the platform
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setAddDialogOpen(true)}
          className="rounded-lg bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20"
        >
          <Plus className="size-4 mr-1" />
          Add Job
        </Button>
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
                  <TableRow
                    key={job.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
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
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-white/30 hover:text-white/60"
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          title="View job"
                        >
                          <ExternalLink className="size-3.5" />
                        </Button>
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

      {/* Add Job Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-zinc-900 border-white/[0.07]">
          <DialogHeader>
            <DialogTitle>Add Job Listing</DialogTitle>
            <DialogDescription>
              Manually create a new job listing on the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="job-company">Company *</Label>
              <Select
                value={jobForm.companyId}
                onValueChange={(v) => v !== null && setJobForm((f) => ({ ...f, companyId: v }))}
              >
                <SelectTrigger
                  id="job-company"
                  className="rounded-[14px] border-white/[0.07] bg-white/[0.03]"
                >
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="job-title">Title *</Label>
              <Input
                id="job-title"
                placeholder="e.g. Senior Full-Stack Engineer"
                value={jobForm.title}
                onChange={(e) => setJobForm((f) => ({ ...f, title: e.target.value }))}
                className="rounded-[14px] border-white/[0.07] bg-white/[0.03]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="job-description">Description</Label>
              <Textarea
                id="job-description"
                placeholder="Job description..."
                value={jobForm.description}
                onChange={(e) => setJobForm((f) => ({ ...f, description: e.target.value }))}
                className="rounded-[14px] border-white/[0.07] bg-white/[0.03] min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="job-location">Location</Label>
                <Input
                  id="job-location"
                  placeholder="e.g. Athens, Greece"
                  value={jobForm.location}
                  onChange={(e) => setJobForm((f) => ({ ...f, location: e.target.value }))}
                  className="rounded-[14px] border-white/[0.07] bg-white/[0.03]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="job-type">Type</Label>
                <Select
                  value={jobForm.type}
                  onValueChange={(v) => v !== null && setJobForm((f) => ({ ...f, type: v }))}
                >
                  <SelectTrigger
                    id="job-type"
                    className="rounded-[14px] border-white/[0.07] bg-white/[0.03]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONSITE">On-site</SelectItem>
                    <SelectItem value="REMOTE">Remote</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="job-url">External URL</Label>
              <Input
                id="job-url"
                placeholder="https://..."
                value={jobForm.externalUrl}
                onChange={(e) => setJobForm((f) => ({ ...f, externalUrl: e.target.value }))}
                className="rounded-[14px] border-white/[0.07] bg-white/[0.03]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              className="rounded-lg border-white/[0.07] text-white/40 hover:text-white/60"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddJob}
              disabled={submitting}
              className="rounded-lg bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20"
            >
              {submitting ? "Creating..." : "Create Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
