"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Pencil, Trash2, Star, StarOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  AUTO_GENERATED: "bg-gray-500/20 text-gray-400",
  CLAIMED: "bg-blue-500/20 text-blue-400",
  VERIFIED: "bg-emerald-500/20 text-emerald-400",
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Companies
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all companies on the platform
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger>
            <Button size="sm">
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
                <Label htmlFor="add-name">Name</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-industry">Industry</Label>
                <Input
                  id="add-industry"
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  placeholder="e.g., Technology"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-website">Website</Label>
                <Input
                  id="add-website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAdd}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Followers</TableHead>
              <TableHead className="text-right">Jobs</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No companies found
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    {company.name}
                  </TableCell>
                  <TableCell>{company.industry}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusColors[company.status] || "bg-muted text-muted-foreground"
                      }
                    >
                      {company.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {company.followerCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
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
                        onClick={() => openEdit(company)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-red-400 hover:text-red-300"
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
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-industry">Industry</Label>
              <Input
                id="edit-industry"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
