"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Download } from "lucide-react";
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

interface Candidate {
  id: string;
  name: string;
  email: string;
  experienceLevel: string;
  skills: string[];
  joinedAt: string;
}

const experienceLevelLabels: Record<string, string> = {
  STUDENT: "Student",
  JUNIOR: "Junior",
  MID: "Mid-level",
  SENIOR: "Senior",
  LEAD: "Lead",
  "N/A": "N/A",
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Candidates
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            All registered candidates on the platform
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleExportCSV}>
          <Download className="size-4 mr-1" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={expFilter} onValueChange={setExpFilter}>
          <SelectTrigger className="w-[180px]">
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  No candidates found
                </TableCell>
              </TableRow>
            ) : (
              candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">
                    {candidate.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {candidate.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {experienceLevelLabels[candidate.experienceLevel] ||
                        candidate.experienceLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground truncate block max-w-[200px]">
                      {candidate.skills.length > 0
                        ? candidate.skills.slice(0, 3).join(", ") +
                          (candidate.skills.length > 3
                            ? ` +${candidate.skills.length - 3}`
                            : "")
                        : "No skills listed"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(candidate.joinedAt).toLocaleDateString()}
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
