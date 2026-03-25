"use client";

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

interface PartnerData {
  id: string;
  name: string;
  logo: string;
  website: string | null;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const defaultForm = {
  name: "",
  logo: "",
  website: "",
  order: "0",
};

interface PartnerFormProps {
  formData: typeof defaultForm;
  setFormData: Dispatch<SetStateAction<typeof defaultForm>>;
  onSubmit: () => void;
  submitLabel: string;
}

function PartnerForm({ formData, setFormData, onSubmit, submitLabel }: PartnerFormProps) {
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("logo", file);
    try {
      const res = await fetch("/api/admin/partners/upload-logo", { method: "POST", body: fd });
      const data = await res.json();
      if (data.logoUrl) {
        setFormData((prev) => ({ ...prev, logo: data.logoUrl }));
        toast.success("Logo uploaded");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    }
  }

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label className="text-white/[0.35] text-xs">Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Partner name"
          className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-white/[0.35] text-xs">Logo * <span className="text-white/20 font-normal">— recommended: SVG or PNG, 200×80px, transparent background</span></Label>
        <div className="flex gap-2">
          <Input
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            placeholder="https://example.com/logo.png"
            className="flex-1 rounded-[14px] border-white/[0.07] bg-white/[0.03]"
          />
          <label className="shrink-0 cursor-pointer rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs text-white/40 hover:text-white/60 transition-colors">
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-white/[0.35] text-xs">Website URL</Label>
        <Input
          value={formData.website}
          onChange={(e) =>
            setFormData({ ...formData, website: e.target.value })
          }
          placeholder="https://example.com"
          className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-white/[0.35] text-xs">Display Order</Label>
        <Input
          type="number"
          value={formData.order}
          onChange={(e) =>
            setFormData({ ...formData, order: e.target.value })
          }
          placeholder="0"
          className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
        />
      </div>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" className="rounded-lg" />}>
          Cancel
        </DialogClose>
        <Button
          onClick={onSubmit}
          className="bg-primary text-primary-foreground rounded-lg"
        >
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function PartnersManager() {
  const [partners, setPartners] = useState<PartnerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerData | null>(null);
  const [formData, setFormData] = useState(defaultForm);

  const fetchPartners = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/partners");
      const data = await res.json();
      setPartners(data.partners || []);
    } catch {
      toast.error("Failed to load partners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleAdd = async () => {
    if (!formData.name || !formData.logo) {
      toast.error("Name and logo URL are required");
      return;
    }
    try {
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          logo: formData.logo,
          website: formData.website || null,
          order: parseInt(formData.order, 10) || 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create partner");
        return;
      }
      toast.success("Partner created");
      setAddDialogOpen(false);
      setFormData(defaultForm);
      fetchPartners();
    } catch {
      toast.error("Failed to create partner");
    }
  };

  const handleEdit = async () => {
    if (!editingPartner) return;
    if (!formData.name || !formData.logo) {
      toast.error("Name and logo URL are required");
      return;
    }
    try {
      const res = await fetch(`/api/admin/partners/${editingPartner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          logo: formData.logo,
          website: formData.website || null,
          order: parseInt(formData.order, 10) || 0,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to update partner");
        return;
      }
      toast.success("Partner updated");
      setEditDialogOpen(false);
      setEditingPartner(null);
      fetchPartners();
    } catch {
      toast.error("Failed to update partner");
    }
  };

  const handleDelete = async (partner: PartnerData) => {
    if (!confirm(`Delete "${partner.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/partners/${partner.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to delete partner");
        return;
      }
      toast.success("Partner deleted");
      fetchPartners();
    } catch {
      toast.error("Failed to delete partner");
    }
  };

  const handleToggleActive = async (partner: PartnerData) => {
    try {
      const res = await fetch(`/api/admin/partners/${partner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !partner.active }),
      });
      if (!res.ok) {
        toast.error("Failed to update partner");
        return;
      }
      toast.success(partner.active ? "Partner deactivated" : "Partner activated");
      fetchPartners();
    } catch {
      toast.error("Failed to update partner");
    }
  };

  const openEdit = (partner: PartnerData) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      logo: partner.logo,
      website: partner.website || "",
      order: partner.order.toString(),
    });
    setEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Partners
          </h2>
          <p className="text-sm text-white/[0.35] mt-1">
            Manage partner logos displayed on the landing page
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={(open) => { if (open) setFormData(defaultForm); setAddDialogOpen(open); }}>
          <DialogTrigger
            render={<Button size="sm" className="bg-primary text-primary-foreground rounded-lg" />}
          >
            <Plus className="size-4 mr-1" />
            Add Partner
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Partner</DialogTitle>
            </DialogHeader>
            <PartnerForm formData={formData} setFormData={setFormData} onSubmit={handleAdd} submitLabel="Create Partner" />
          </DialogContent>
        </Dialog>
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
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">
                  Logo
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">
                  Name
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02]">
                  Website
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02] text-center">
                  Order
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02] text-center">
                  Active
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.02] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.length === 0 ? (
                <TableRow className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <TableCell
                    colSpan={6}
                    className="text-center text-white/30 py-8"
                  >
                    No partners found
                  </TableCell>
                </TableRow>
              ) : (
                partners.map((partner) => (
                  <TableRow
                    key={partner.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <TableCell>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.02] p-1">
                        <Image
                          src={partner.logo}
                          alt={partner.name}
                          width={40}
                          height={40}
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-[13px]">
                      {partner.name}
                    </TableCell>
                    <TableCell className="text-[13px] text-white/[0.35]">
                      {partner.website ? (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          {partner.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-white/20">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-[13px] text-white/[0.35]">
                      {partner.order}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={partner.active}
                          onCheckedChange={() => handleToggleActive(partner)}
                          size="sm"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-white/30 hover:text-white/60"
                          onClick={() => openEdit(partner)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-400/60 hover:text-red-400"
                          onClick={() => handleDelete(partner)}
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
            <DialogTitle>Edit Partner</DialogTitle>
          </DialogHeader>
          <PartnerForm formData={formData} setFormData={setFormData} onSubmit={handleEdit} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
