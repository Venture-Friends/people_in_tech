"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Globe, RotateCcw, Type } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

const CONTENT_KEYS = [
  { key: "hero.heading", label: "Hero Heading", default: "Your Next Role\nStarts Here.", type: "input" },
  { key: "hero.subheading", label: "Hero Subheading", default: "Join the talent pool trusted by leading tech employers in Greece. One profile, every opportunity.", type: "input" },
  { key: "hero.cta", label: "Hero CTA Text", default: "Explore Companies", type: "input" },
  { key: "about.text", label: "About Section Text", default: "", type: "textarea" },
  { key: "footer.tagline", label: "Footer Tagline", default: "Greece's premier tech talent pool — powered by POS4work", type: "input" },
] as const;

type ContentKeyDef = (typeof CONTENT_KEYS)[number];

interface ContentBlock {
  id?: string;
  key: string;
  value: string;
  locale: string;
  updatedBy?: string | null;
  updatedAt?: string;
}

function getSectionFromKey(key: string): string {
  const prefix = key.split(".")[0];
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

function groupBySection(keys: readonly ContentKeyDef[]): Record<string, ContentKeyDef[]> {
  const groups: Record<string, ContentKeyDef[]> = {};
  for (const def of keys) {
    const section = getSectionFromKey(def.key);
    if (!groups[section]) groups[section] = [];
    groups[section].push(def);
  }
  return groups;
}

export function ContentEditor() {
  const [locale, setLocale] = useState<"en" | "el">("en");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBlocks = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/content?locale=${locale}`);
      if (!res.ok) {
        toast.error("Failed to load content blocks");
        return;
      }
      const data = await res.json();
      setBlocks(data.blocks || []);
      setEditedValues({});
    } catch {
      toast.error("Failed to load content blocks");
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    setLoading(true);
    fetchBlocks();
  }, [fetchBlocks]);

  const getCurrentValue = (key: string): string => {
    const block = blocks.find((b) => b.key === key);
    return block?.value ?? "";
  };

  const getDisplayValue = (key: string): string => {
    if (key in editedValues) return editedValues[key];
    return getCurrentValue(key);
  };

  const getDefaultValue = (key: string): string => {
    const def = CONTENT_KEYS.find((d) => d.key === key);
    return def?.default ?? "";
  };

  const handleChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges = Object.keys(editedValues).length > 0;

  const modifiedKeys = Object.entries(editedValues).filter(([key, val]) => {
    return val !== getCurrentValue(key);
  });

  const handleSave = async () => {
    if (modifiedKeys.length === 0) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    try {
      const payload = modifiedKeys.map(([key, value]) => ({
        key,
        value,
        locale,
      }));

      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: payload }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save content");
        return;
      }

      toast.success(`Saved ${modifiedKeys.length} content block${modifiedKeys.length > 1 ? "s" : ""}`);
      await fetchBlocks();
    } catch {
      toast.error("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setEditedValues({});
  };

  const sections = groupBySection(CONTENT_KEYS);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Content
          </h2>
          <p className="text-sm text-white/[0.35] mt-1">
            Edit website copy and content blocks
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-white/[0.07] text-white/40 hover:text-white/60"
              onClick={handleReset}
            >
              <RotateCcw className="size-4 mr-1.5" />
              Discard
            </Button>
          )}
          <Button
            size="sm"
            className="bg-primary text-primary-foreground rounded-lg"
            onClick={handleSave}
            disabled={saving || modifiedKeys.length === 0}
          >
            <Save className="size-4 mr-1.5" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Locale tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-1 w-fit">
        {(["en", "el"] as const).map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              locale === loc
                ? "bg-primary/[0.1] text-primary"
                : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
            }`}
          >
            <Globe className="size-3.5" />
            {loc === "en" ? "English" : "Greek"}
          </button>
        ))}
      </div>

      {/* Content sections */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(sections).map(([section, keys]) => (
            <div
              key={section}
              className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5"
            >
              <div className="mb-5">
                <h3 className="font-display text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <Type className="size-4 text-white/30" />
                  {section}
                </h3>
                <p className="text-xs text-white/30 mt-0.5">
                  Manage {section.toLowerCase()} section content
                </p>
              </div>
              <div className="space-y-4">
                {keys.map((def) => {
                  const value = getDisplayValue(def.key);
                  const defaultVal = getDefaultValue(def.key);
                  const isModified =
                    def.key in editedValues &&
                    editedValues[def.key] !== getCurrentValue(def.key);

                  return (
                    <div key={def.key} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`content-${def.key}`}
                          className="text-white/[0.35] text-xs"
                        >
                          {def.label}
                        </Label>
                        {isModified && (
                          <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                            Modified
                          </span>
                        )}
                        <span className="text-[10px] text-white/20 ml-auto font-mono">
                          {def.key}
                        </span>
                      </div>
                      {def.type === "textarea" ? (
                        <Textarea
                          id={`content-${def.key}`}
                          value={value}
                          onChange={(e) => handleChange(def.key, e.target.value)}
                          placeholder={defaultVal || "Enter content..."}
                          className="min-h-[120px] rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20 text-[13px]"
                        />
                      ) : (
                        <Input
                          id={`content-${def.key}`}
                          value={value}
                          onChange={(e) => handleChange(def.key, e.target.value)}
                          placeholder={defaultVal || "Enter content..."}
                          className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20 text-[13px]"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Change summary */}
      {modifiedKeys.length > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] backdrop-blur-[8px] p-4">
          <p className="text-[13px] text-primary font-medium">
            {modifiedKeys.length} unsaved change{modifiedKeys.length > 1 ? "s" : ""}
          </p>
          <p className="text-[11px] text-white/30 mt-0.5">
            {modifiedKeys.map(([key]) => key).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
