"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Plus, Pencil, Trash2, Sparkles, Loader2, ScanSearch, ExternalLink } from "lucide-react";
import { useSortableTable, SortableHead } from "@/components/admin/sortable-header";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { JobScraperPanel } from "@/components/admin/job-scraper-panel";

interface Company {
  id: string;
  name: string;
  slug: string;
  industry: string;
  website: string | null;
  description: string | null;
  linkedinUrl: string | null;
  careersUrl: string | null;
  logo: string | null;
  coverImage: string | null;
  size: string;
  founded: number | null;
  locations: string;
  technologies: string;
  status: string;
  featured: boolean;
  vcFunded: boolean;
  followerCount: number;
  jobCount: number;
  createdAt: string;
}

interface EditFormData {
  name: string;
  industry: string;
  website: string;
  description: string;
  linkedinUrl: string;
  careersUrl: string;
  logo: string;
  coverImage: string;
  size: string;
  founded: string;
  locations: string;
  technologies: string;
  featured: boolean;
  vcFunded: boolean;
}

const statusColors: Record<string, string> = {
  AUTO_GENERATED: "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30",
  CLAIMED: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  VERIFIED: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
};

const sizeOptions = [
  { value: "SMALL", label: "Small (1-50)" },
  { value: "MEDIUM", label: "Medium (51-200)" },
  { value: "LARGE", label: "Large (201-1000)" },
  { value: "ENTERPRISE", label: "Enterprise (1000+)" },
];

const inputClass = "rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20";
const sectionHeaderClass = "text-sm font-medium text-white/60 pt-2";
const labelClass = "text-white/[0.35] text-xs";

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CompaniesTable() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    industry: "",
    website: "",
    description: "",
  });

  const companyGetters = useMemo(() => ({
    name: (c: Company) => c.name,
    industry: (c: Company) => c.industry,
    status: (c: Company) => c.status,
    followers: (c: Company) => c.followerCount,
    jobs: (c: Company) => c.jobCount,
    featured: (c: Company) => c.featured,
  }), []);
  const { sorted: sortedCompanies, sort: companySort, toggle: toggleCompanySort } = useSortableTable(companies, companyGetters);

  // Edit sheet state
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: "",
    industry: "",
    website: "",
    description: "",
    linkedinUrl: "",
    careersUrl: "",
    logo: "",
    coverImage: "",
    size: "SMALL",
    founded: "",
    locations: "",
    technologies: "",
    featured: false,
    vcFunded: false,
  });
  const [saving, setSaving] = useState(false);
  const [enrichingInEdit, setEnrichingInEdit] = useState(false);

  // Enrichment review dialog
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [enrichResult, setEnrichResult] = useState<{
    description?: string | null;
    logo?: string | null;
    linkedinUrl?: string | null;
    technologies?: string[];
  } | null>(null);
  const [enrichDialogOpen, setEnrichDialogOpen] = useState(false);
  const [enrichCompanyId, setEnrichCompanyId] = useState<string | null>(null);

  // Job scraper
  const [scraperOpen, setScraperOpen] = useState(false);
  const [scraperCompany, setScraperCompany] = useState<Company | null>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/companies?${params}`);
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchCompanies, 300);
    return () => clearTimeout(timeout);
  }, [fetchCompanies]);

  const handleAdd = async () => {
    if (!addFormData.name || !addFormData.industry) {
      toast.error("Name and industry are required");
      return;
    }
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addFormData),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create company");
        return;
      }
      toast.success("Company created successfully");
      setAddDialogOpen(false);
      setAddFormData({ name: "", industry: "", website: "", description: "" });
      fetchCompanies();
    } catch {
      toast.error("Failed to create company");
    }
  };

  const handleEdit = async () => {
    if (!editingCompany) return;
    setSaving(true);
    try {
      const locationsArr = editFormData.locations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const techArr = editFormData.technologies
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const body: Record<string, unknown> = {
        name: editFormData.name,
        industry: editFormData.industry,
        website: editFormData.website || null,
        description: editFormData.description || null,
        linkedinUrl: editFormData.linkedinUrl || null,
        careersUrl: editFormData.careersUrl || null,
        logo: editFormData.logo || null,
        coverImage: editFormData.coverImage || null,
        size: editFormData.size,
        founded: editFormData.founded ? parseInt(editFormData.founded, 10) : null,
        locations: JSON.stringify(locationsArr),
        technologies: JSON.stringify(techArr),
        featured: editFormData.featured,
        vcFunded: editFormData.vcFunded,
      };

      const res = await fetch(`/api/admin/companies/${editingCompany.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        toast.error("Failed to update company");
        return;
      }
      toast.success("Company updated");
      setEditSheetOpen(false);
      setEditingCompany(null);
      fetchCompanies();
    } catch {
      toast.error("Failed to update company");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeatured = async (company: Company) => {
    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !company.featured }),
      });
      if (!res.ok) {
        toast.error("Failed to update featured status");
        return;
      }
      toast.success(
        company.featured ? "Company unfeatured" : "Company featured"
      );
      fetchCompanies();
    } catch {
      toast.error("Failed to toggle featured");
    }
  };

  const handleDelete = async (company: Company) => {
    if (!confirm(`Delete "${company.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to delete company");
        return;
      }
      toast.success("Company deleted");
      fetchCompanies();
    } catch {
      toast.error("Failed to delete company");
    }
  };

  const handleEnrich = async (company: Company) => {
    setEnrichingId(company.id);
    try {
      const res = await fetch(`/api/admin/companies/${company.id}/enrich`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to enrich");
        return;
      }
      const { enrichment } = await res.json();
      setEnrichResult(enrichment);
      setEnrichCompanyId(company.id);
      setEnrichDialogOpen(true);
    } catch {
      toast.error("Failed to enrich company");
    } finally {
      setEnrichingId(null);
    }
  };

  const handleApplyEnrichment = async () => {
    if (!enrichCompanyId || !enrichResult) return;
    try {
      const updates: Record<string, string | boolean> = {};
      if (enrichResult.description) updates.description = enrichResult.description;
      if (enrichResult.logo) updates.logo = enrichResult.logo;
      if (enrichResult.linkedinUrl) updates.linkedinUrl = enrichResult.linkedinUrl;
      if (enrichResult.technologies?.length) updates.technologies = JSON.stringify(enrichResult.technologies);

      const res = await fetch(`/api/admin/companies/${enrichCompanyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        toast.error("Failed to apply enrichment");
        return;
      }
      toast.success("Enrichment applied");
      setEnrichDialogOpen(false);
      setEnrichResult(null);
      fetchCompanies();
    } catch {
      toast.error("Failed to apply enrichment");
    }
  };

  const handleEnrichInEdit = async () => {
    if (!editingCompany) return;
    setEnrichingInEdit(true);
    try {
      const res = await fetch(`/api/admin/companies/${editingCompany.id}/enrich`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to enrich");
        return;
      }
      const { enrichment } = await res.json();

      // Pre-fill fields from enrichment
      let fieldsApplied = 0;
      setEditFormData((prev) => {
        const updated = { ...prev };
        if (enrichment.description && !prev.description) {
          updated.description = enrichment.description;
          fieldsApplied++;
        }
        if (enrichment.logo && !prev.logo) {
          updated.logo = enrichment.logo;
          fieldsApplied++;
        }
        if (enrichment.linkedinUrl && !prev.linkedinUrl) {
          updated.linkedinUrl = enrichment.linkedinUrl;
          fieldsApplied++;
        }
        if (enrichment.technologies?.length && !prev.technologies) {
          updated.technologies = enrichment.technologies.join(", ");
          fieldsApplied++;
        }
        return updated;
      });

      if (fieldsApplied > 0) {
        toast.success(`Enriched ${fieldsApplied} field(s) from website`);
      } else {
        toast.info("No new data found, or fields already filled");
      }
    } catch {
      toast.error("Failed to enrich company");
    } finally {
      setEnrichingInEdit(false);
    }
  };

  const openEdit = (company: Company) => {
    setEditingCompany(company);
    const locations = parseJsonArray(company.locations);
    const technologies = parseJsonArray(company.technologies);

    setEditFormData({
      name: company.name,
      industry: company.industry,
      website: company.website || "",
      description: company.description || "",
      linkedinUrl: company.linkedinUrl || "",
      careersUrl: company.careersUrl || "",
      logo: company.logo || "",
      coverImage: company.coverImage || "",
      size: company.size || "SMALL",
      founded: company.founded ? String(company.founded) : "",
      locations: locations.join(", "),
      technologies: technologies.join(", "),
      featured: company.featured,
      vcFunded: company.vcFunded,
    });
    setEditSheetOpen(true);
  };

  const updateEditField = (field: keyof EditFormData, value: string | boolean) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Companies
          </h2>
          <p className="text-sm text-white/[0.35] mt-1">
            Manage all companies on the platform
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground rounded-lg"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="size-4 mr-1" />
            Add Company
          </Button>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Company</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="add-name" className={labelClass}>Name</Label>
                <Input
                  id="add-name"
                  value={addFormData.name}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, name: e.target.value })
                  }
                  placeholder="Company name"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-industry" className={labelClass}>Industry</Label>
                <Input
                  id="add-industry"
                  value={addFormData.industry}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, industry: e.target.value })
                  }
                  placeholder="e.g., Technology"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-website" className={labelClass}>Website</Label>
                <Input
                  id="add-website"
                  value={addFormData.website}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, website: e.target.value })
                  }
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" className="rounded-lg" />}>
                Cancel
              </DialogClose>
              <Button onClick={handleAdd} className="bg-primary text-primary-foreground rounded-lg">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v !== null && setStatusFilter(v)}>
          <SelectTrigger className="w-[180px] rounded-[14px] border-white/[0.07] bg-white/[0.03]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="AUTO_GENERATED">Auto-generated</SelectItem>
            <SelectItem value="CLAIMED">Claimed</SelectItem>
            <SelectItem value="VERIFIED">Verified</SelectItem>
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
                <SortableHead label="Name" sortKey="name" currentKey={companySort.key} direction={companySort.direction} onToggle={toggleCompanySort} />
                <SortableHead label="Industry" sortKey="industry" currentKey={companySort.key} direction={companySort.direction} onToggle={toggleCompanySort} />
                <SortableHead label="Status" sortKey="status" currentKey={companySort.key} direction={companySort.direction} onToggle={toggleCompanySort} />
                <SortableHead label="Followers" sortKey="followers" currentKey={companySort.key} direction={companySort.direction} onToggle={toggleCompanySort} className="text-right" />
                <SortableHead label="Jobs" sortKey="jobs" currentKey={companySort.key} direction={companySort.direction} onToggle={toggleCompanySort} className="text-right" />
                <SortableHead label="Featured" sortKey="featured" currentKey={companySort.key} direction={companySort.direction} onToggle={toggleCompanySort} />
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.length === 0 ? (
                <TableRow className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <TableCell
                    colSpan={7}
                    className="text-center text-white/30 py-8"
                  >
                    No companies found
                  </TableCell>
                </TableRow>
              ) : (
                sortedCompanies.map((company) => (
                  <TableRow key={company.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <TableCell className="font-medium text-[13px]">
                      {company.name}
                    </TableCell>
                    <TableCell className="text-[13px] text-white/[0.35]">{company.industry}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          statusColors[company.status] || "bg-white/[0.05] text-white/30"
                        }`}
                      >
                        {company.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-[13px]">
                      {company.followerCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-[13px]">
                      {company.jobCount}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={company.featured}
                        onCheckedChange={() => handleToggleFeatured(company)}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-primary/60 hover:text-primary"
                          onClick={() => {
                            setScraperCompany(company);
                            setScraperOpen(true);
                          }}
                          title="Scan Jobs"
                        >
                          <ScanSearch className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-primary/60 hover:text-primary"
                          onClick={() => handleEnrich(company)}
                          disabled={enrichingId === company.id}
                          title="Enrich from website"
                        >
                          {enrichingId === company.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-white/30 hover:text-white/60"
                          onClick={() => openEdit(company)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-400/60 hover:text-red-400"
                          onClick={() => handleDelete(company)}
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

      {/* Enrichment Review Dialog */}
      <Dialog open={enrichDialogOpen} onOpenChange={setEnrichDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Enrichment Results</DialogTitle>
          </DialogHeader>
          {enrichResult && (
            <div className="space-y-3 py-2 max-h-[400px] overflow-y-auto">
              {enrichResult.description && (
                <div className="space-y-1">
                  <Label className={labelClass}>Description</Label>
                  <p className="text-[13px] text-white/60 rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                    {enrichResult.description}
                  </p>
                </div>
              )}
              {enrichResult.logo && (
                <div className="space-y-1">
                  <Label className={labelClass}>Logo</Label>
                  <p className="text-[13px] text-white/60 truncate">{enrichResult.logo}</p>
                </div>
              )}
              {enrichResult.linkedinUrl && (
                <div className="space-y-1">
                  <Label className={labelClass}>LinkedIn</Label>
                  <p className="text-[13px] text-primary truncate">{enrichResult.linkedinUrl}</p>
                </div>
              )}
              {enrichResult.technologies && enrichResult.technologies.length > 0 && (
                <div className="space-y-1">
                  <Label className={labelClass}>Technologies</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {enrichResult.technologies.map((tech) => (
                      <span key={tech} className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] text-white/40">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {!enrichResult.description && !enrichResult.logo && !enrichResult.linkedinUrl && (!enrichResult.technologies || enrichResult.technologies.length === 0) && (
                <p className="text-sm text-white/30 text-center py-4">No data could be extracted from the website.</p>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="rounded-lg" />}>
              Cancel
            </DialogClose>
            <Button onClick={handleApplyEnrichment} className="bg-primary text-primary-foreground rounded-lg">Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Scraper Panel */}
      {scraperCompany && (
        <JobScraperPanel
          companyId={scraperCompany.id}
          companyName={scraperCompany.name}
          open={scraperOpen}
          onOpenChange={(open) => {
            setScraperOpen(open);
            if (!open) setScraperCompany(null);
          }}
        />
      )}

      {/* Edit Company Sheet (slide-over panel) */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent
          side="right"
          className="w-[500px] sm:w-[600px] sm:max-w-[600px] overflow-y-auto border-white/[0.06] bg-[#0a0a0b]/95 backdrop-blur-xl"
        >
          <SheetHeader className="border-b border-white/[0.06] pb-4">
            <SheetTitle className="text-lg">
              Edit Company
            </SheetTitle>
            {editingCompany && (
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    statusColors[editingCompany.status] || "bg-white/[0.05] text-white/30"
                  }`}
                >
                  {editingCompany.status.replace("_", " ")}
                </span>
                <span className="text-[11px] text-white/25">
                  /{editingCompany.slug}
                </span>
              </div>
            )}
          </SheetHeader>

          <div className="space-y-5 py-5 px-4">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className={sectionHeaderClass}>Basic Info</h3>
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className={labelClass}>Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => updateEditField("name", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-industry" className={labelClass}>Industry</Label>
                <Input
                  id="edit-industry"
                  value={editFormData.industry}
                  onChange={(e) => updateEditField("industry", e.target.value)}
                  placeholder="e.g., Technology"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-size" className={labelClass}>Size</Label>
                  <Select
                    value={editFormData.size}
                    onValueChange={(v) => v !== null && updateEditField("size", v)}
                  >
                    <SelectTrigger className="rounded-[14px] border-white/[0.07] bg-white/[0.03]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-founded" className={labelClass}>Founded</Label>
                  <Input
                    id="edit-founded"
                    type="number"
                    value={editFormData.founded}
                    onChange={(e) => updateEditField("founded", e.target.value)}
                    placeholder="e.g., 2015"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-description" className={labelClass}>Description</Label>
                <textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => updateEditField("description", e.target.value)}
                  rows={3}
                  placeholder="Company description..."
                  className={`w-full resize-none ${inputClass} rounded-[14px] border border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:ring-1 focus:ring-primary/20 focus:outline-none`}
                />
              </div>
            </div>

            {/* Links */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className={sectionHeaderClass}>Links</h3>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleEnrichInEdit}
                  disabled={enrichingInEdit || !editFormData.website}
                  className="text-primary/60 hover:text-primary text-[11px]"
                >
                  {enrichingInEdit ? (
                    <Loader2 className="size-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="size-3 mr-1" />
                  )}
                  Enrich from Website
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-website" className={labelClass}>Website</Label>
                <Input
                  id="edit-website"
                  value={editFormData.website}
                  onChange={(e) => updateEditField("website", e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-linkedin" className={labelClass}>LinkedIn URL</Label>
                <Input
                  id="edit-linkedin"
                  value={editFormData.linkedinUrl}
                  onChange={(e) => updateEditField("linkedinUrl", e.target.value)}
                  placeholder="https://linkedin.com/company/..."
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-careers" className={labelClass}>Careers Page URL</Label>
                <Input
                  id="edit-careers"
                  value={editFormData.careersUrl}
                  onChange={(e) => updateEditField("careersUrl", e.target.value)}
                  placeholder="https://company.com/careers"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Media */}
            <div className="space-y-3">
              <h3 className={sectionHeaderClass}>Media</h3>
              <div className="space-y-1.5">
                <Label htmlFor="edit-logo" className={labelClass}>Logo URL</Label>
                <Input
                  id="edit-logo"
                  value={editFormData.logo}
                  onChange={(e) => updateEditField("logo", e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
                {editFormData.logo && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="size-10 rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editFormData.logo}
                        alt="Logo preview"
                        className="size-10 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <a
                      href={editFormData.logo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-primary/50 hover:text-primary inline-flex items-center gap-1"
                    >
                      <ExternalLink className="size-2.5" />
                      Preview
                    </a>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-cover" className={labelClass}>Cover Image URL</Label>
                <Input
                  id="edit-cover"
                  value={editFormData.coverImage}
                  onChange={(e) => updateEditField("coverImage", e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
                {editFormData.coverImage && (
                  <div className="mt-1.5">
                    <div className="h-20 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editFormData.coverImage}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <h3 className={sectionHeaderClass}>Details</h3>
              <div className="space-y-1.5">
                <Label htmlFor="edit-locations" className={labelClass}>Locations</Label>
                <Input
                  id="edit-locations"
                  value={editFormData.locations}
                  onChange={(e) => updateEditField("locations", e.target.value)}
                  placeholder="Athens, Thessaloniki, Remote"
                  className={inputClass}
                />
                <p className="text-[11px] text-white/25">Comma-separated</p>
                {editFormData.locations && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {editFormData.locations
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((loc) => (
                        <span
                          key={loc}
                          className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] text-white/40"
                        >
                          {loc}
                        </span>
                      ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-technologies" className={labelClass}>Technologies</Label>
                <Input
                  id="edit-technologies"
                  value={editFormData.technologies}
                  onChange={(e) => updateEditField("technologies", e.target.value)}
                  placeholder="React, Python, AWS"
                  className={inputClass}
                />
                <p className="text-[11px] text-white/25">Comma-separated</p>
                {editFormData.technologies && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {editFormData.technologies
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] text-primary/60"
                        >
                          {tech}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <h3 className={sectionHeaderClass}>Status</h3>
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div>
                  <p className="text-[13px] text-white/70">Featured</p>
                  <p className="text-[11px] text-white/25">Show on homepage and in featured sections</p>
                </div>
                <Switch
                  checked={editFormData.featured}
                  onCheckedChange={(checked) => updateEditField("featured", checked)}
                  size="sm"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div>
                  <p className="text-[13px] text-white/70">VC Funded</p>
                  <p className="text-[11px] text-white/25">Show VC-backed badge on company card</p>
                </div>
                <Switch
                  checked={editFormData.vcFunded}
                  onCheckedChange={(checked) => updateEditField("vcFunded", checked)}
                  size="sm"
                />
              </div>
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
              onClick={handleEdit}
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
