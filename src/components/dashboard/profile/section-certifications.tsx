"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Award, Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { CertificationEntry } from "./types";

interface SectionCertificationsProps {
  entries: CertificationEntry[];
  onChange: (entries: CertificationEntry[]) => void;
}

const emptyEntry: CertificationEntry = {
  name: "",
  issuer: "",
  year: undefined,
  order: 0,
};

export function SectionCertifications({
  entries,
  onChange,
}: SectionCertificationsProps) {
  const [editing, setEditing] = useState<CertificationEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  function startAdd() {
    setEditing({ ...emptyEntry, order: entries.length });
    setIsNew(true);
  }

  function startEdit(entry: CertificationEntry) {
    setEditing({ ...entry });
    setIsNew(false);
  }

  function cancel() {
    setEditing(null);
    setIsNew(false);
  }

  async function save() {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast.error("Certification name is required");
      return;
    }

    setSaving(true);
    try {
      const method = isNew ? "POST" : "PUT";
      const res = await fetch("/api/profile/certifications", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      const { entry } = await res.json();

      if (isNew) {
        onChange([...entries, entry]);
      } else {
        onChange(entries.map((e) => (e.id === entry.id ? entry : e)));
      }

      setEditing(null);
      setIsNew(false);
      toast.success(isNew ? "Certification added" : "Certification updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save certification"
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch("/api/profile/certifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete");

      onChange(entries.filter((e) => e.id !== id));
      toast.success("Certification removed");
    } catch {
      toast.error("Failed to remove certification");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-white/70">
          <Award className="size-4" />
          Certifications
        </h3>
        {!editing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={startAdd}
            className="text-xs text-emerald-400/70 hover:text-emerald-400"
          >
            <Plus className="mr-1 size-3.5" />
            Add
          </Button>
        )}
      </div>

      {/* Existing entries */}
      {entries.map((entry) =>
        editing?.id === entry.id && !isNew ? null : (
          <div
            key={entry.id}
            className="group rounded-xl border border-white/[0.05] bg-white/[0.02] p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">
                  {entry.name}
                </p>
                {entry.issuer && (
                  <p className="text-xs text-white/40">{entry.issuer}</p>
                )}
                {entry.year && (
                  <p className="mt-1 text-[10px] text-white/25">{entry.year}</p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => startEdit(entry)}
                  className="rounded-md p-1.5 text-white/30 hover:bg-white/[0.06] hover:text-white/60"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => entry.id && remove(entry.id)}
                  className="rounded-md p-1.5 text-white/30 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* Edit / Add form */}
      {editing && (
        <div className="rounded-xl border border-emerald-500/20 bg-white/[0.02] p-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/40">Certification name</Label>
            <Input
              value={editing.name}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
              placeholder="e.g. AWS Solutions Architect"
              className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/40">Issuing organization</Label>
              <Input
                value={editing.issuer || ""}
                onChange={(e) =>
                  setEditing({ ...editing, issuer: e.target.value })
                }
                placeholder="e.g. Amazon Web Services"
                className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/40">Year</Label>
              <Input
                type="number"
                min={1950}
                max={2040}
                value={editing.year ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    year: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Year obtained"
                className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={save} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <Check className="mr-1.5 size-3.5" />
              )}
              {isNew ? "Add" : "Update"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={cancel}>
              <X className="mr-1.5 size-3.5" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {entries.length === 0 && !editing && (
        <p className="py-6 text-center text-xs text-white/20">
          No certifications added yet
        </p>
      )}
    </div>
  );
}
