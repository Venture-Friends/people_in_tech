"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Briefcase, Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { WorkExperienceEntry } from "./types";

interface SectionExperienceProps {
  entries: WorkExperienceEntry[];
  onChange: (entries: WorkExperienceEntry[]) => void;
}

const emptyEntry: WorkExperienceEntry = {
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
  order: 0,
};

export function SectionExperience({ entries, onChange }: SectionExperienceProps) {
  const [editing, setEditing] = useState<WorkExperienceEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  function startAdd() {
    setEditing({ ...emptyEntry, order: entries.length });
    setIsNew(true);
  }

  function startEdit(entry: WorkExperienceEntry) {
    setEditing({ ...entry });
    setIsNew(false);
  }

  function cancel() {
    setEditing(null);
    setIsNew(false);
  }

  async function save() {
    if (!editing) return;
    if (!editing.company.trim() || !editing.role.trim() || !editing.startDate) {
      toast.error("Company, role, and start date are required");
      return;
    }

    setSaving(true);
    try {
      const method = isNew ? "POST" : "PUT";
      const payload = {
        ...editing,
        startDate: editing.startDate,
        endDate: editing.endDate || undefined,
      };

      const res = await fetch("/api/profile/work-experience", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      toast.success(isNew ? "Experience added" : "Experience updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save experience"
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch("/api/profile/work-experience", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete");

      onChange(entries.filter((e) => e.id !== id));
      toast.success("Experience removed");
    } catch {
      toast.error("Failed to remove experience");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-white/70">
          <Briefcase className="size-4" />
          Work Experience
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
                  {entry.role}
                </p>
                <p className="text-xs text-white/40">{entry.company}</p>
                <p className="mt-1 text-[10px] text-white/25">
                  {formatDate(entry.startDate)} &mdash;{" "}
                  {entry.current ? "Present" : formatDate(entry.endDate)}
                </p>
                {entry.description && (
                  <p className="mt-2 text-xs text-white/30 line-clamp-2">
                    {entry.description}
                  </p>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/40">Company</Label>
              <Input
                value={editing.company}
                onChange={(e) =>
                  setEditing({ ...editing, company: e.target.value })
                }
                placeholder="Company name"
                className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/40">Role</Label>
              <Input
                value={editing.role}
                onChange={(e) =>
                  setEditing({ ...editing, role: e.target.value })
                }
                placeholder="Job title"
                className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/40">Start date</Label>
              <Input
                type="date"
                value={editing.startDate ? editing.startDate.slice(0, 10) : ""}
                onChange={(e) =>
                  setEditing({ ...editing, startDate: e.target.value })
                }
                className="bg-white/[0.04] border-white/[0.06] text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/40">End date</Label>
              <Input
                type="date"
                value={
                  editing.endDate ? editing.endDate.slice(0, 10) : ""
                }
                onChange={(e) =>
                  setEditing({ ...editing, endDate: e.target.value })
                }
                disabled={editing.current}
                className="bg-white/[0.04] border-white/[0.06] text-sm disabled:opacity-30"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={editing.current}
              onCheckedChange={(checked) =>
                setEditing({
                  ...editing,
                  current: !!checked,
                  endDate: checked ? "" : editing.endDate,
                })
              }
            />
            <span className="text-xs text-white/40">I currently work here</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/40">Description</Label>
            <Textarea
              value={editing.description || ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              placeholder="Describe your role..."
              rows={3}
              maxLength={1000}
              className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20 text-sm resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={save}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <Check className="mr-1.5 size-3.5" />
              )}
              {isNew ? "Add" : "Update"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={cancel}
            >
              <X className="mr-1.5 size-3.5" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {entries.length === 0 && !editing && (
        <p className="py-6 text-center text-xs text-white/20">
          No work experience added yet
        </p>
      )}
    </div>
  );
}

function formatDate(date?: string) {
  if (!date) return "";
  try {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return date;
  }
}
