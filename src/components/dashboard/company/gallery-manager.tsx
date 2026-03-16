"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  ImageIcon,
} from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  order: number;
}

export function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newUrl, setNewUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [editingCaption, setEditingCaption] = useState<{
    id: string;
    value: string;
  } | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/company/gallery");
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  async function handleAdd() {
    if (!newUrl) {
      toast.error("Image URL is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/company/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newUrl,
          caption: newCaption || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to add image");
      toast.success("Image added to gallery");
      setNewUrl("");
      setNewCaption("");
      setAddOpen(false);
      fetchImages();
    } catch {
      toast.error("Failed to add image");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(
        `/api/dashboard/company/gallery?id=${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete image");
      toast.success("Image removed from gallery");
      fetchImages();
    } catch {
      toast.error("Failed to delete image");
    }
  }

  async function handleUpdateCaption(id: string, caption: string) {
    try {
      const res = await fetch("/api/dashboard/company/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, caption }),
      });
      if (!res.ok) throw new Error("Failed to update caption");
      toast.success("Caption updated");
      setEditingCaption(null);
      fetchImages();
    } catch {
      toast.error("Failed to update caption");
    }
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    const idx = images.findIndex((img) => img.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= images.length) return;

    const currentOrder = images[idx].order;
    const swapOrder = images[swapIdx].order;

    try {
      await Promise.all([
        fetch("/api/dashboard/company/gallery", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: images[idx].id, order: swapOrder }),
        }),
        fetch("/api/dashboard/company/gallery", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: images[swapIdx].id, order: currentOrder }),
        }),
      ]);
      fetchImages();
    } catch {
      toast.error("Failed to reorder images");
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-white">
          Gallery ({images.length})
        </h3>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="bg-primary text-primary-foreground rounded-lg">
                <Plus className="size-4" />
                Upload Image
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Add Gallery Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="add-img-url" className="text-[13px] font-medium text-white/50">Image URL</Label>
                <Input
                  id="add-img-url"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-img-caption" className="text-[13px] font-medium text-white/50">Caption</Label>
                <Input
                  id="add-img-caption"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Describe the image..."
                  className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              {newUrl && (
                <div className="overflow-hidden rounded-xl border border-white/[0.05]">
                  <img
                    src={newUrl}
                    alt="Preview"
                    className="h-40 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" className="border border-white/[0.08] bg-transparent text-white/50" />}>
                Cancel
              </DialogClose>
              <Button onClick={handleAdd} disabled={submitting} className="bg-primary text-primary-foreground rounded-lg">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Add Image
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {images.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center">
          <ImageIcon className="mx-auto mb-3 size-8 text-white/30" />
          <p className="text-white/[0.35]">
            No gallery images yet. Add images to showcase your workspace and
            culture.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, idx) => (
            <div key={img.id} className="rounded-xl border border-white/[0.05] bg-white/[0.02] overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={img.url}
                  alt={img.caption || "Gallery image"}
                  className="size-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%231e1b2e' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' fill='%2364748b' text-anchor='middle' dominant-baseline='middle' font-family='system-ui'%3EImage not found%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute right-2 top-2 flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon-xs"
                    onClick={() => handleReorder(img.id, "up")}
                    disabled={idx === 0}
                    className="border border-white/[0.08] bg-black/50 backdrop-blur-sm text-white/50 hover:text-white/80"
                  >
                    <ChevronUp className="size-3" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon-xs"
                    onClick={() => handleReorder(img.id, "down")}
                    disabled={idx === images.length - 1}
                    className="border border-white/[0.08] bg-black/50 backdrop-blur-sm text-white/50 hover:text-white/80"
                  >
                    <ChevronDown className="size-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon-xs"
                    onClick={() => handleDelete(img.id)}
                    className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                {editingCaption?.id === img.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editingCaption.value}
                      onChange={(e) =>
                        setEditingCaption({
                          id: img.id,
                          value: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateCaption(img.id, editingCaption.value);
                        }
                        if (e.key === "Escape") {
                          setEditingCaption(null);
                        }
                      }}
                      className="h-7 text-xs rounded-[14px] border-white/[0.07] bg-white/[0.03]"
                      autoFocus
                    />
                    <Button
                      size="xs"
                      onClick={() =>
                        handleUpdateCaption(img.id, editingCaption.value)
                      }
                      className="bg-primary text-primary-foreground rounded-lg"
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <p
                    className="cursor-pointer text-[13px] text-white/[0.35] hover:text-white/60 transition-colors"
                    onClick={() =>
                      setEditingCaption({
                        id: img.id,
                        value: img.caption || "",
                      })
                    }
                  >
                    {img.caption || "Click to add caption..."}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
