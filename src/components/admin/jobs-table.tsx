"use client";

import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Search, Play, Pause, Trash2, ExternalLink, Plus, Pencil, Loader2, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useSortableTable, SortableHead } from "@/components/admin/sortable-header";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

interface Job {
  id: string;
  title: string;
  companyName: string;
  companySlug: string;
  location: string | null;
  type: string;
  description: string | null;
  externalUrl: string;
  status: string;
  postedAt: string;
  interestCount: number;
}

interface InterestedCandidate {
  userId: string;
  name: string;
  headline: string | null;
  experienceLevel: string | null;
  expressedAt: string;
}

interface EditJobFormData {
  title: string;
  description: string;
  location: string;
  type: string;
  externalUrl: string;
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

  const jobGetters = useMemo(() => ({
    title: (j: Job) => j.title,
    company: (j: Job) => j.companyName,
    location: (j: Job) => j.location,
    type: (j: Job) => j.type,
    status: (j: Job) => j.status,
    posted: (j: Job) => j.postedAt,
    interested: (j: Job) => j.interestCount,
  }), []);
  const { sorted: sortedJobs, sort: jobSort, toggle: toggleJobSort } = useSortableTable(jobs, jobGetters);

  // Interested candidates state
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [interestedCandidates, setInterestedCandidates] = useState<InterestedCandidate[]>([]);
  const [loadingInterested, setLoadingInterested] = useState(false);

  // Edit sheet state
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editFormData, setEditFormData] = useState<EditJobFormData>({
    title: "",
    description: "",
    location: "",
    type: "ONSITE",
    externalUrl: "",
  });
  const [saving, setSaving] = useState(false);

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

  const toggleInterested = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
      return;
    }
    setExpandedJobId(jobId);
    setLoadingInterested(true);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/interested`);
      const data = await res.json();
      setInterestedCandidates(data.candidates || []);
    } catch {
      toast.error("Failed to load interested candidates");
    } finally {
      setLoadingInterested(false);
    }
  };

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setEditFormData({
      title: job.title,
      description: job.description || "",
      location: job.location || "",
      type: job.type,
      externalUrl: job.externalUrl || "",
    });
    setEditSheetOpen(true);
  };

  const updateEditField = (field: keyof EditJobFormData, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditJob = async () => {
    if (!editingJob) return;
    if (!editFormData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: editFormData.title.trim(),
        description: editFormData.description.trim() || null,
        location: editFormData.location.trim() || null,
        type: editFormData.type,
        externalUrl: editFormData.externalUrl.trim() || "",
      };

      const res = await fetch(`/api/admin/jobs/${editingJob.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        toast.error("Failed to update job");
        return;
      }

      toast.success("Job updated");
      setEditSheetOpen(false);
      setEditingJob(null);
      fetchJobs();
    } catch {
      toast.error("Failed to update job");
    } finally {
      setSaving(false);
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
                <SortableHead label="Title" sortKey="title" currentKey={jobSort.key} direction={jobSort.direction} onToggle={toggleJobSort} />
                <SortableHead label="Company" sortKey="company" currentKey={jobSort.key} direction={jobSort.direction} onToggle={toggleJobSort} />
                <SortableHead label="Location" sortKey="location" currentKey={jobSort.key} direction={jobSort.direction} onToggle={toggleJobSort} />
                <SortableHead label="Type" sortKey="type" currentKey={jobSort.key} direction={jobSort.direction} onToggle={toggleJobSort} />
                <SortableHead label="Status" sortKey="status" currentKey={jobSort.key} direction={jobSort.direction} onToggle={toggleJobSort} />
                <SortableHead label="Posted" sortKey="posted" currentKey={jobSort.key} direction={jobSort.direction} onToggle={toggleJobSort} />
                <SortableHead label="Interested" sortKey="interested" currentKey={jobSort.key} direction={jobSort.direction} onToggle={toggleJobSort} />
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <TableCell
                    colSpan={8}
                    className="text-center text-white/30 py-8"
                  >
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                sortedJobs.map((job) => (
                  <Fragment key={job.id}>
                  <TableRow
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => openEdit(job)}
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
                    <TableCell>
                      {job.interestCount > 0 ? (
                        <button
                          onClick={(e) => toggleInterested(job.id, e)}
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors"
                        >
                          <Users className="size-3" />
                          {job.interestCount}
                          {expandedJobId === job.id ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                        </button>
                      ) : (
                        <span className="text-[11px] text-white/20">0</span>
                      )}
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
                          className="text-white/30 hover:text-white/60"
                          onClick={() => openEdit(job)}
                          title="Edit job"
                        >
                          <Pencil className="size-3.5" />
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
                  {expandedJobId === job.id && (
                    <TableRow className="border-b border-white/[0.04] bg-white/[0.01]">
                      <TableCell colSpan={8} className="p-0">
                        <div className="px-6 py-4">
                          <h4 className="text-[12px] font-semibold text-white/50 uppercase tracking-wider mb-3">
                            Interested Candidates
                          </h4>
                          {loadingInterested ? (
                            <div className="flex items-center gap-2 text-white/30 text-sm py-2">
                              <Loader2 className="size-3.5 animate-spin" /> Loading...
                            </div>
                          ) : interestedCandidates.length === 0 ? (
                            <p className="text-sm text-white/25">No interested candidates yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {interestedCandidates.map((c) => (
                                <a
                                  key={c.userId}
                                  href={`/profile/${c.userId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors"
                                >
                                  <div>
                                    <p className="text-[13px] font-medium text-foreground">{c.name}</p>
                                    <p className="text-[11px] text-white/35">
                                      {c.headline || c.experienceLevel || "Candidate"}
                                    </p>
                                  </div>
                                  <span className="text-[11px] text-white/20">
                                    {new Date(c.expressedAt).toLocaleDateString()}
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  </Fragment>
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

      {/* Edit Job Sheet (slide-over panel) */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent
          side="right"
          className="w-[500px] sm:w-[600px] sm:max-w-[600px] overflow-y-auto border-white/[0.06] bg-[#0a0a0b]/95 backdrop-blur-xl"
        >
          <SheetHeader className="border-b border-white/[0.06] pb-4">
            <SheetTitle className="text-lg">
              Edit Job
            </SheetTitle>
            {editingJob && (
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    statusColors[editingJob.status] || "bg-white/[0.05] text-white/30"
                  }`}
                >
                  {editingJob.status}
                </span>
                <span className="text-[11px] text-white/25">
                  {editingJob.companyName}
                </span>
              </div>
            )}
          </SheetHeader>

          <div className="space-y-5 py-5 px-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-job-title" className="text-white/[0.35] text-xs">Title *</Label>
              <Input
                id="edit-job-title"
                value={editFormData.title}
                onChange={(e) => updateEditField("title", e.target.value)}
                className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-job-description" className="text-white/[0.35] text-xs">Description</Label>
              <Textarea
                id="edit-job-description"
                value={editFormData.description}
                onChange={(e) => updateEditField("description", e.target.value)}
                rows={4}
                placeholder="Job description..."
                className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20 min-h-[100px]"
              />
            </div>

            {/* Location & Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-job-location" className="text-white/[0.35] text-xs">Location</Label>
                <Input
                  id="edit-job-location"
                  value={editFormData.location}
                  onChange={(e) => updateEditField("location", e.target.value)}
                  placeholder="e.g. Athens, Greece"
                  className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-job-type" className="text-white/[0.35] text-xs">Type</Label>
                <Select
                  value={editFormData.type}
                  onValueChange={(v) => v !== null && updateEditField("type", v)}
                >
                  <SelectTrigger className="rounded-[14px] border-white/[0.07] bg-white/[0.03]">
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

            {/* External URL */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-job-url" className="text-white/[0.35] text-xs">External URL</Label>
              <Input
                id="edit-job-url"
                value={editFormData.externalUrl}
                onChange={(e) => updateEditField("externalUrl", e.target.value)}
                placeholder="https://..."
                className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          <SheetFooter className="border-t border-white/[0.06] pt-4 flex-row gap-2">
            <Button
              variant="outline"
              className="rounded-lg flex-1"
              onClick={() => setEditSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditJob}
              disabled={saving}
              className="bg-primary text-primary-foreground rounded-lg flex-1"
            >
              {saving ? (
                <Loader2 className="size-4 mr-1.5 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
