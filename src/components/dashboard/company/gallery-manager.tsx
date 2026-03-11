"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Gallery ({images.length})
        </h3>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <Plus className="size-4" />
                Upload Image
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Gallery Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="add-img-url">Image URL</Label>
                <Input
                  id="add-img-url"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-img-caption">Caption</Label>
                <Input
                  id="add-img-caption"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Describe the image..."
                />
              </div>
              {newUrl && (
                <div className="overflow-hidden rounded-lg border border-border">
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
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button onClick={handleAdd} disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Add Image
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <ImageIcon className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            No gallery images yet. Add images to showcase your workspace and
            culture.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, idx) => (
            <Card key={img.id} className="overflow-hidden">
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
                  >
                    <ChevronUp className="size-3" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon-xs"
                    onClick={() => handleReorder(img.id, "down")}
                    disabled={idx === images.length - 1}
                  >
                    <ChevronDown className="size-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon-xs"
                    onClick={() => handleDelete(img.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
              <CardContent className="pt-3">
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
                      className="h-7 text-xs"
                      autoFocus
                    />
                    <Button
                      size="xs"
                      onClick={() =>
                        handleUpdateCaption(img.id, editingCaption.value)
                      }
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <p
                    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
