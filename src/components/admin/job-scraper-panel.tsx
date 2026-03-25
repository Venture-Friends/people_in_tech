"use client";

import { useState } from "react";
import { Search, Loader2, ExternalLink, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface ScrapedJobWithDuplicate {
  title: string;
  url: string;
  location: string | null;
  type: "REMOTE" | "HYBRID" | "ONSITE" | null;
  department: string | null;
  description: string | null;
  source: "greenhouse" | "lever" | "workable" | "linkedin" | "generic";
  confidence: "high" | "medium" | "low";
  alreadyImported: boolean;
}

type ScrapeSource = "careers" | "linkedin";

interface JobScraperPanelProps {
  companyId: string;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const confidenceColors: Record<string, string> = {
  high: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const sourceColors: Record<string, string> = {
  greenhouse: "bg-green-500/20 text-green-400 border-green-500/30",
  lever: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  workable: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  linkedin: "bg-blue-600/20 text-blue-300 border-blue-600/30",
  generic: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export function JobScraperPanel({
  companyId,
  companyName,
  open,
  onOpenChange,
}: JobScraperPanelProps) {
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [jobs, setJobs] = useState<ScrapedJobWithDuplicate[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [careersUrl, setCareersUrl] = useState<string | null>(null);
  const [careersUrlInput, setCareersUrlInput] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [scanned, setScanned] = useState(false);
  const [source, setSource] = useState<ScrapeSource>("careers");

  const handleScan = async () => {
    setScanning(true);
    setJobs([]);
    setSelected(new Set());
    setErrors([]);
    setScanned(false);

    try {
      const body: Record<string, string> = { source };
      if (source === "careers" && careersUrlInput.trim()) {
        body.careersUrl = careersUrlInput.trim();
      }

      const res = await fetch(`/api/admin/companies/${companyId}/scrape-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to scan for jobs");
        return;
      }

      const data = await res.json();
      setJobs(data.jobs || []);
      setCareersUrl(data.careersUrl || null);
      setErrors(data.errors || []);
      setScanned(true);

      // Auto-select non-duplicate jobs
      const autoSelect = new Set<number>();
      (data.jobs || []).forEach((job: ScrapedJobWithDuplicate, i: number) => {
        if (!job.alreadyImported) {
          autoSelect.add(i);
        }
      });
      setSelected(autoSelect);

      if (data.jobs?.length > 0) {
        toast.success(`Found ${data.jobs.length} job(s)`);
      } else {
        toast.info("No jobs found");
      }
    } catch {
      toast.error("Failed to scan for jobs");
    } finally {
      setScanning(false);
    }
  };

  const handleImport = async () => {
    const selectedJobs = jobs.filter((_, i) => selected.has(i));
    if (selectedJobs.length === 0) {
      toast.error("No jobs selected");
      return;
    }

    setImporting(true);
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/import-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: selectedJobs }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to import jobs");
        return;
      }

      const data = await res.json();
      toast.success(`Imported ${data.imported} job(s)${data.skipped > 0 ? `, skipped ${data.skipped} duplicate(s)` : ""}`);

      // Mark newly imported jobs as duplicates
      setJobs((prev) =>
        prev.map((job, i) =>
          selected.has(i) ? { ...job, alreadyImported: true } : job
        )
      );
      setSelected(new Set());
    } catch {
      toast.error("Failed to import jobs");
    } finally {
      setImporting(false);
    }
  };

  const toggleJob = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set<number>();
    jobs.forEach((job, i) => {
      if (!job.alreadyImported) {
        all.add(i);
      }
    });
    setSelected(all);
  };

  const deselectAll = () => {
    setSelected(new Set());
  };

  const selectableCount = jobs.filter((j) => !j.alreadyImported).length;

  const sourceOptions: { value: ScrapeSource; label: string }[] = [
    { value: "careers", label: "Careers Page" },
    { value: "linkedin", label: "LinkedIn" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Job Scanner — {companyName}</DialogTitle>
          {careersUrl && (
            <p className="text-xs text-white/30 truncate mt-1">
              {careersUrl}
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-3">
          {/* Source selector */}
          {!scanned && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <p className="text-sm text-white/40 text-center">
                Choose a source and scan for job listings.
              </p>

              {/* Source chips */}
              <div className="flex items-center gap-2">
                {sourceOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSource(opt.value)}
                    className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                      source === opt.value
                        ? "border-primary/25 bg-primary/5 text-primary"
                        : "border-white/[0.06] text-white/45 hover:border-white/[0.12] hover:text-white/60"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Careers URL input (only for careers source) */}
              {source === "careers" && (
                <div className="w-full max-w-sm space-y-1.5">
                  <Label htmlFor="careers-url-input" className="text-white/[0.35] text-xs">
                    Careers Page URL (optional override)
                  </Label>
                  <Input
                    id="careers-url-input"
                    value={careersUrlInput}
                    onChange={(e) => setCareersUrlInput(e.target.value)}
                    placeholder="https://company.com/careers"
                    className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20 text-sm"
                  />
                  <p className="text-[11px] text-white/25">
                    Leave blank to use the saved careers URL or auto-detect from website
                  </p>
                </div>
              )}

              <Button
                onClick={handleScan}
                disabled={scanning}
                className="bg-primary text-primary-foreground rounded-lg"
              >
                {scanning ? (
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                ) : (
                  <Search className="size-4 mr-1.5" />
                )}
                {scanning ? "Scanning..." : `Scan ${source === "linkedin" ? "LinkedIn" : "Careers Page"}`}
              </Button>
            </div>
          )}

          {/* Results */}
          {scanned && (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setScanned(false);
                      setJobs([]);
                      setSelected(new Set());
                      setErrors([]);
                    }}
                    className="text-white/40 hover:text-white/60"
                  >
                    <Search className="size-3 mr-1" />
                    New Scan
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={handleScan}
                    disabled={scanning}
                    className="text-white/40 hover:text-white/60"
                  >
                    {scanning ? (
                      <Loader2 className="size-3 mr-1 animate-spin" />
                    ) : (
                      <Search className="size-3 mr-1" />
                    )}
                    Re-scan
                  </Button>
                  {selectableCount > 0 && (
                    <>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={selectAll}
                        className="text-white/40 hover:text-white/60"
                      >
                        Select All ({selectableCount})
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={deselectAll}
                        className="text-white/40 hover:text-white/60"
                      >
                        Deselect All
                      </Button>
                    </>
                  )}
                </div>
                <span className="text-xs text-white/30">
                  {jobs.length} found &middot; {selected.size} selected
                </span>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2.5">
                  {errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-400">
                      {err}
                    </p>
                  ))}
                </div>
              )}

              {/* Job list */}
              {jobs.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-6">
                  No jobs were found from this source.
                </p>
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
                  {jobs.map((job, i) => (
                    <label
                      key={i}
                      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                        job.alreadyImported
                          ? "border-white/[0.04] bg-white/[0.01] opacity-50"
                          : selected.has(i)
                            ? "border-primary/30 bg-primary/[0.04]"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(i)}
                        onChange={() => toggleJob(i)}
                        disabled={job.alreadyImported}
                        className="mt-0.5 size-4 rounded border-white/20 bg-white/5 accent-primary cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-medium text-white/80 leading-tight">
                            {job.title}
                          </span>
                          {job.alreadyImported && (
                            <span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400">
                              <Check className="size-2.5" />
                              Imported
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {job.location && (
                            <span className="text-[11px] text-white/30">
                              {job.location}
                            </span>
                          )}
                          {job.type && (
                            <span className="text-[10px] text-white/30 rounded-full border border-white/[0.06] px-1.5 py-0.5">
                              {job.type}
                            </span>
                          )}
                          {job.department && (
                            <span className="text-[11px] text-white/25 italic">
                              {job.department}
                            </span>
                          )}
                          <span
                            className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${sourceColors[job.source]}`}
                          >
                            {job.source}
                          </span>
                          <span
                            className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${confidenceColors[job.confidence]}`}
                          >
                            {job.confidence}
                          </span>
                        </div>
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary/50 hover:text-primary mt-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="size-2.5" />
                            View posting
                          </a>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" className="rounded-lg" />}>
            <X className="size-3.5 mr-1" />
            Close
          </DialogClose>
          {scanned && selected.size > 0 && (
            <Button
              onClick={handleImport}
              disabled={importing || selected.size === 0}
              className="bg-primary text-primary-foreground rounded-lg"
            >
              {importing ? (
                <Loader2 className="size-4 mr-1.5 animate-spin" />
              ) : null}
              Import {selected.size} Job{selected.size !== 1 ? "s" : ""}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
