"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface Job {
  id: string;
  title: string;
  location: string | null;
  type: string;
  externalUrl: string;
  status: string;
  postedAt: string;
}

export function JobManager() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Add form state
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newType, setNewType] = useState("ONSITE");
  const [newUrl, setNewUrl] = useState("");

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editType, setEditType] = useState("ONSITE");
  const [editUrl, setEditUrl] = useState("");

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/company/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  async function handleAdd() {
    if (!newTitle || !newUrl) {
      toast.error("Title and external URL are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/company/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          location: newLocation || null,
          type: newType,
          externalUrl: newUrl,
        }),
      });
      if (!res.ok) throw new Error("Failed to create job");
      toast.success("Job listing created");
      setNewTitle("");
      setNewLocation("");
      setNewType("ONSITE");
      setNewUrl("");
      setAddOpen(false);
      fetchJobs();
    } catch {
      toast.error("Failed to create job listing");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit() {
    if (!editingJob) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/dashboard/company/jobs/${editingJob.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editTitle,
            location: editLocation || null,
            type: editType,
            externalUrl: editUrl,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update job");
      toast.success("Job listing updated");
      setEditOpen(false);
      setEditingJob(null);
      fetchJobs();
    } catch {
      toast.error("Failed to update job listing");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(job: Job) {
    const newStatus = job.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch(`/api/dashboard/company/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(
        `Job ${newStatus === "ACTIVE" ? "activated" : "paused"}`
      );
      fetchJobs();
    } catch {
      toast.error("Failed to update job status");
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/dashboard/company/jobs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete job");
      toast.success("Job listing deleted");
      fetchJobs();
    } catch {
      toast.error("Failed to delete job listing");
    }
  }

  function openEdit(job: Job) {
    setEditingJob(job);
    setEditTitle(job.title);
    setEditLocation(job.location || "");
    setEditType(job.type);
    setEditUrl(job.externalUrl);
    setEditOpen(true);
  }

  const statusClasses = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "PAUSED":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      case "EXPIRED":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-white/10 text-white/50 border border-white/10";
    }
  };

  const typeClasses = (type: string) => {
    switch (type) {
      case "REMOTE":
        return "bg-sky-500/20 text-sky-400 border border-sky-500/30";
      case "HYBRID":
        return "bg-violet-500/20 text-violet-400 border border-violet-500/30";
      default:
        return "bg-white/10 text-white/50 border border-white/10";
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-white">
          Job Listings ({jobs.length})
        </h3>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="bg-primary text-primary-foreground rounded-lg">
                <Plus className="size-4" />
                Add Job
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Add Job Listing</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="add-title" className="text-[13px] font-medium text-white/50">Title</Label>
                <Input
                  id="add-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-location" className="text-[13px] font-medium text-white/50">Location</Label>
                <Input
                  id="add-location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Dublin, Ireland"
                  className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-medium text-white/50">Type</Label>
                <Select value={newType} onValueChange={(v) => v !== null && setNewType(v)}>
                  <SelectTrigger className="w-full rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONSITE">Onsite</SelectItem>
                    <SelectItem value="REMOTE">Remote</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-url" className="text-[13px] font-medium text-white/50">External URL</Label>
                <Input
                  id="add-url"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://careers.example.com/job/123"
                  className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" className="border border-white/[0.08] bg-transparent text-white/50" />}>
                Cancel
              </DialogClose>
              <Button onClick={handleAdd} disabled={submitting} className="bg-primary text-primary-foreground rounded-lg">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center">
          <p className="text-white/[0.35]">
            No job listings yet. Add your first job listing to get started.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/[0.04] hover:bg-transparent">
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Title</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Location</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Type</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Status</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Posted</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <TableCell className="text-[13px] font-medium text-white/80">{job.title}</TableCell>
                  <TableCell className="text-[13px] text-white/40">{job.location || "Not specified"}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${typeClasses(job.type)}`}>
                      {job.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClasses(job.status)}`}>
                      {job.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-[13px] text-white/40">
                    {new Date(job.postedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Switch
                        checked={job.status === "ACTIVE"}
                        onCheckedChange={() => handleToggleStatus(job)}
                        size="sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(job)}
                        className="text-white/40 hover:text-white/60"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(job.id)}
                        className="text-red-400/60 hover:text-red-400"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Job Listing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-[13px] font-medium text-white/50">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location" className="text-[13px] font-medium text-white/50">Location</Label>
              <Input
                id="edit-location"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-white/50">Type</Label>
              <Select value={editType} onValueChange={(v) => v !== null && setEditType(v)}>
                <SelectTrigger className="w-full rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONSITE">Onsite</SelectItem>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url" className="text-[13px] font-medium text-white/50">External URL</Label>
              <Input
                id="edit-url"
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="border border-white/[0.08] bg-transparent text-white/50" />}>
              Cancel
            </DialogClose>
            <Button onClick={handleEdit} disabled={submitting} className="bg-primary text-primary-foreground rounded-lg">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
