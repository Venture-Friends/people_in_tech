"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Upload, Loader2, Globe, ImageIcon } from "lucide-react";
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

type LogoFetchStatus = "idle" | "fetching" | "found" | "not-found" | "error";

export function PartnersManager() {
  const [partners, setPartners] = useState<PartnerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerData | null>(null);
  const [formData, setFormData] = useState(defaultForm);
  const [logoFetchStatus, setLogoFetchStatus] = useState<LogoFetchStatus>("idle");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const resetLogoState = () => {
    setLogoFetchStatus("idle");
    setLogoPreview(null);
  };

  const handleWebsiteBlur = async (websiteUrl: string) => {
    if (!websiteUrl.trim()) {
      resetLogoState();
      return;
    }

    // Don't re-fetch if logo already set (e.g. editing existing partner)
    if (formData.logo && logoFetchStatus !== "idle") return;

    setLogoFetchStatus("fetching");
    setLogoPreview(null);

    try {
      const res = await fetch("/api/admin/partners/fetch-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });
      const data = await res.json();

      if (res.ok && data.logoUrl) {
        setLogoFetchStatus("found");
        setLogoPreview(data.logoUrl);
        setFormData((prev) => ({ ...prev, logo: data.logoUrl }));
        toast.success("Logo found automatically");
      } else {
        setLogoFetchStatus("not-found");
        toast.info("Could not find logo. You can upload one manually.");
      }
    } catch {
      setLogoFetchStatus("error");
      toast.error("Failed to fetch logo");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formPayload = new FormData();
      formPayload.append("logo", file);

      const res = await fetch("/api/admin/partners/upload-logo", {
        method: "POST",
        body: formPayload,
      });
      const data = await res.json();

      if (res.ok && data.logoUrl) {
        setFormData((prev) => ({ ...prev, logo: data.logoUrl }));
        setLogoPreview(data.logoUrl);
        setLogoFetchStatus("found");
        toast.success("Logo uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload logo");
      }
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
      // Reset file input so re-selecting the same file triggers onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
      resetLogoState();
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
      resetLogoState();
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
    setLogoPreview(partner.logo);
    setLogoFetchStatus(partner.logo ? "found" : "idle");
    setEditDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setFormData(defaultForm);
      resetLogoState();
    }
  };

  const PartnerForm = ({
    onSubmit,
    submitLabel,
  }: {
    onSubmit: () => void;
    submitLabel: string;
  }) => (
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
        <Label className="text-white/[0.35] text-xs">Website URL</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/20" />
          <Input
            value={formData.website}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            onBlur={(e) => handleWebsiteBlur(e.target.value)}
            placeholder="https://example.com"
            className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20 pl-9"
          />
        </div>
        {logoFetchStatus === "fetching" && (
          <p className="text-xs text-white/30 flex items-center gap-1.5 mt-1">
            <Loader2 className="size-3 animate-spin" />
            Searching for logo...
          </p>
        )}
      </div>

      {/* Logo section */}
      <div className="space-y-1.5">
        <Label className="text-white/[0.35] text-xs">Logo *</Label>
        <div className="flex items-start gap-3">
          {/* Logo preview */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] overflow-hidden">
            {logoPreview || formData.logo ? (
              <Image
                src={logoPreview || formData.logo}
                alt="Logo preview"
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
                unoptimized
              />
            ) : (
              <ImageIcon className="size-6 text-white/15" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            {/* Logo URL input */}
            <Input
              value={formData.logo}
              onChange={(e) => {
                setFormData({ ...formData, logo: e.target.value });
                setLogoPreview(e.target.value || null);
              }}
              placeholder="Logo URL (auto-filled or paste manually)"
              className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20 text-xs"
            />

            {/* Status messages and upload button */}
            {logoFetchStatus === "not-found" && (
              <p className="text-xs text-amber-400/70">
                No logo found automatically. Upload or paste a URL.
              </p>
            )}
            {logoFetchStatus === "error" && (
              <p className="text-xs text-red-400/70">
                Error fetching logo. Upload or paste a URL.
              </p>
            )}

            {/* Upload button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg text-xs h-8 border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-3 mr-1.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="size-3 mr-1.5" />
                    Upload logo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
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
        <DialogClose>
          <Button variant="outline" className="rounded-lg">
            Cancel
          </Button>
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
        <Dialog
          open={addDialogOpen}
          onOpenChange={(open) => {
            setAddDialogOpen(open);
            handleDialogClose(open);
          }}
        >
          <DialogTrigger>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground rounded-lg"
            >
              <Plus className="size-4 mr-1" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Partner</DialogTitle>
            </DialogHeader>
            <PartnerForm onSubmit={handleAdd} submitLabel="Create Partner" />
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
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditingPartner(null);
            resetLogoState();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Partner</DialogTitle>
          </DialogHeader>
          <PartnerForm onSubmit={handleEdit} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
