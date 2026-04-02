"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Languages, Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { SpokenLanguageEntry } from "./types";

interface SectionLanguagesProps {
  entries: SpokenLanguageEntry[];
  onChange: (entries: SpokenLanguageEntry[]) => void;
}

const PROFICIENCY_OPTIONS = [
  { value: "NATIVE", label: "Native" },
  { value: "FLUENT", label: "Fluent" },
  { value: "CONVERSATIONAL", label: "Conversational" },
  { value: "BASIC", label: "Basic" },
] as const;

const emptyEntry: SpokenLanguageEntry = {
  name: "",
  proficiency: "CONVERSATIONAL",
};

export function SectionLanguages({ entries, onChange }: SectionLanguagesProps) {
  const [editing, setEditing] = useState<SpokenLanguageEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  function startAdd() {
    setEditing({ ...emptyEntry });
    setIsNew(true);
  }

  function startEdit(entry: SpokenLanguageEntry) {
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
      toast.error("Language name is required");
      return;
    }

    setSaving(true);
    try {
      const method = isNew ? "POST" : "PUT";
      const res = await fetch("/api/profile/languages", {
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
      toast.success(isNew ? "Language added" : "Language updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save language"
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch("/api/profile/languages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete");

      onChange(entries.filter((e) => e.id !== id));
      toast.success("Language removed");
    } catch {
      toast.error("Failed to remove language");
    }
  }

  function proficiencyLabel(value: string) {
    return (
      PROFICIENCY_OPTIONS.find((o) => o.value === value)?.label ?? value
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-white/70">
          <Languages className="size-4" />
          Spoken Languages
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-white/80">
                  {entry.name}
                </p>
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/30">
                  {proficiencyLabel(entry.proficiency)}
                </span>
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
            <Label className="text-xs text-white/40">Language</Label>
            <Input
              value={editing.name}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
              placeholder="e.g. Greek, English, German"
              className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/40">Proficiency</Label>
            <div className="flex flex-wrap gap-2">
              {PROFICIENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setEditing({ ...editing, proficiency: opt.value })
                  }
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    editing.proficiency === opt.value
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12] hover:text-white/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
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
          No languages added yet
        </p>
      )}
    </div>
  );
}
