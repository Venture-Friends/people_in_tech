"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Pencil, Trash2, Star, StarOff } from "lucide-react";
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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Company {
  id: string;
  name: string;
  slug: string;
  industry: string;
  status: string;
  featured: boolean;
  followerCount: number;
  jobCount: number;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  AUTO_GENERATED: "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30",
  CLAIMED: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  VERIFIED: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
};

export function CompaniesTable() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    website: "",
    description: "",
  });

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
    if (!formData.name || !formData.industry) {
      toast.error("Name and industry are required");
      return;
    }
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create company");
        return;
      }
      toast.success("Company created successfully");
      setAddDialogOpen(false);
      setFormData({ name: "", industry: "", website: "", description: "" });
      fetchCompanies();
    } catch {
      toast.error("Failed to create company");
    }
  };

  const handleEdit = async () => {
    if (!editingCompany) return;
    try {
      const res = await fetch(`/api/admin/companies/${editingCompany.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          industry: formData.industry,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to update company");
        return;
      }
      toast.success("Company updated");
      setEditDialogOpen(false);
      setEditingCompany(null);
      fetchCompanies();
    } catch {
      toast.error("Failed to update company");
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

  const openEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry,
      website: "",
      description: "",
    });
    setEditDialogOpen(true);
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
          <DialogTrigger>
            <Button size="sm" className="bg-primary text-primary-foreground rounded-lg">
              <Plus className="size-4 mr-1" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Company</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="add-name" className="text-white/[0.35] text-xs">Name</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Company name"
                  className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-industry" className="text-white/[0.35] text-xs">Industry</Label>
                <Input
                  id="add-industry"
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  placeholder="e.g., Technology"
                  className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-website" className="text-white/[0.35] text-xs">Website</Label>
                <Input
                  id="add-website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://..."
                  className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose>
                <Button variant="outline" className="rounded-lg">Cancel</Button>
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
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Name</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Industry</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Status</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02] text-right">Followers</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02] text-right">Jobs</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">Featured</TableHead>
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
                companies.map((company) => (
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
                          className="text-white/30 hover:text-white/60"
                          onClick={() =>
                            handleToggleFeatured(company)
                          }
                          title={
                            company.featured ? "Unfeature" : "Feature"
                          }
                        >
                          {company.featured ? (
                            <StarOff className="size-3.5" />
                          ) : (
                            <Star className="size-3.5" />
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-white/[0.35] text-xs">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-industry" className="text-white/[0.35] text-xs">Industry</Label>
              <Input
                id="edit-industry"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline" className="rounded-lg">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEdit} className="bg-primary text-primary-foreground rounded-lg">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
