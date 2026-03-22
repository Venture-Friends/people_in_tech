"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Download } from "lucide-react";
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

interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  experienceLevel: string;
  skills: string[];
  joinedAt: string;
  onboardingComplete: boolean;
}

const experienceLevelLabels: Record<string, string> = {
  STUDENT: "Student",
  JUNIOR: "Junior",
  MID: "Mid-level",
  SENIOR: "Senior",
  LEAD: "Lead",
  "N/A": "N/A",
};

const experienceLevelColors: Record<string, string> = {
  STUDENT: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  JUNIOR: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  MID: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  SENIOR: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  LEAD: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
};

export function CandidatesTable() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expFilter, setExpFilter] = useState("ALL");

  const fetchCandidates = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (expFilter !== "ALL") params.set("experienceLevel", expFilter);
      const res = await fetch(`/api/admin/candidates?${params}`);
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch {
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }, [search, expFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchCandidates, 300);
    return () => clearTimeout(timeout);
  }, [fetchCandidates]);

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      params.set("format", "csv");
      if (search) params.set("search", search);
      if (expFilter !== "ALL") params.set("experienceLevel", expFilter);

      const res = await fetch(`/api/admin/candidates?${params}`);
      const csvText = await res.text();

      const blob = new Blob([csvText], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "candidates.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Candidates
          </h2>
          <p className="text-sm text-white/[0.35] mt-1">
            All registered candidates on the platform
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleExportCSV} className="rounded-lg border-white/[0.07] text-white/40 hover:text-white/60">
          <Download className="size-4 mr-1" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <Select value={expFilter} onValueChange={(v) => v !== null && setExpFilter(v)}>
          <SelectTrigger className="w-[180px] rounded-[14px] border-white/[0.07] bg-white/[0.03]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Levels</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
            <SelectItem value="JUNIOR">Junior</SelectItem>
            <SelectItem value="MID">Mid-level</SelectItem>
            <SelectItem value="SENIOR">Senior</SelectItem>
            <SelectItem value="LEAD">Lead</SelectItem>
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
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Name</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Email</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Experience</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Onboarding</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Skills</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.length === 0 ? (
                <TableRow className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <TableCell
                    colSpan={6}
                    className="text-center text-white/30 py-8"
                  >
                    No candidates found
                  </TableCell>
                </TableRow>
              ) : (
                candidates.map((candidate) => (
                  <TableRow key={candidate.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <TableCell className="font-medium text-[13px]">
                      {candidate.name}
                    </TableCell>
                    <TableCell className="text-[13px] text-white/[0.35]">
                      {candidate.email}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          experienceLevelColors[candidate.experienceLevel] || "bg-white/[0.05] text-white/30"
                        }`}
                      >
                        {experienceLevelLabels[candidate.experienceLevel] ||
                          candidate.experienceLevel}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          candidate.onboardingComplete
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {candidate.onboardingComplete ? "Complete" : "Pending"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] text-white/[0.35] truncate block max-w-[200px]">
                        {candidate.skills.length > 0
                          ? candidate.skills.slice(0, 3).join(", ") +
                            (candidate.skills.length > 3
                              ? ` +${candidate.skills.length - 3}`
                              : "")
                          : "No skills listed"}
                      </span>
                    </TableCell>
                    <TableCell className="text-[13px] text-white/[0.35]">
                      {new Date(candidate.joinedAt).toLocaleDateString()}
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
