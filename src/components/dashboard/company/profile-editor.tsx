"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/shared/tag-input";
import { toast } from "sonner";
import { Save, Loader2, Upload, X } from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  description: string | null;
  industry: string;
  website: string | null;
  linkedinUrl: string | null;
  logo: string | null;
  coverImage: string | null;
  size: string;
  founded: number | null;
  locations: string;
  technologies: string;
}

interface ProfileEditorProps {
  initialData: ProfileData;
}

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Media",
  "Gaming",
  "Cybersecurity",
  "AI/ML",
  "SaaS",
  "Consulting",
  "Other",
];

const COMPANY_SIZES = [
  { value: "STARTUP", label: "Startup (1-10)" },
  { value: "SMALL", label: "Small (11-50)" },
  { value: "MEDIUM", label: "Medium (51-200)" },
  { value: "LARGE", label: "Large (201-1000)" },
  { value: "ENTERPRISE", label: "Enterprise (1000+)" },
];

const LOCATION_SUGGESTIONS = [
  "Dublin",
  "Cork",
  "Galway",
  "Limerick",
  "Belfast",
  "London",
  "Berlin",
  "Amsterdam",
  "Remote",
  "New York",
  "San Francisco",
];

function ImageUploadArea({
  field,
  label,
  value,
  onChange,
  guidelines,
  maxSize,
  previewClassName,
}: {
  field: "logo" | "cover";
  label: string;
  value: string;
  onChange: (url: string) => void;
  guidelines: string;
  maxSize: string;
  previewClassName: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("field", field);

      const res = await fetch("/api/dashboard/company/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      onChange(data.url);
      toast.success(`${label} uploaded successfully`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload file"
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-[13px] font-medium text-white/50">{label}</Label>
        <span className="text-[11px] text-white/25">{guidelines}</span>
      </div>

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt={`${label} preview`}
            className={`${previewClassName} rounded-xl border border-white/[0.05] overflow-hidden object-cover`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-white/[0.1] bg-black/80 text-white/50 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : null}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-dashed border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:border-emerald-500/20 hover:bg-white/[0.03]"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex size-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
          {uploading ? (
            <Loader2 className="size-4 animate-spin text-emerald-400" />
          ) : (
            <Upload className="size-4 text-white/30" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-white/60">
            {uploading ? "Uploading..." : "Click to upload"}
          </p>
          <p className="text-[11px] text-white/25">
            PNG, JPG, SVG, or WebP. Max {maxSize}.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-white/[0.05]" />
        <span className="text-[10px] uppercase tracking-wider text-white/20">or paste URL</span>
        <div className="h-px flex-1 bg-white/[0.05]" />
      </div>
      <Input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`https://example.com/${field === "logo" ? "logo.png" : "cover.jpg"}`}
        className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
      />
    </div>
  );
}

export function ProfileEditor({ initialData }: ProfileEditorProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(
    initialData.description || ""
  );
  const [industry, setIndustry] = useState(initialData.industry);
  const [size, setSize] = useState(initialData.size);
  const [founded, setFounded] = useState(
    initialData.founded?.toString() || ""
  );
  const [website, setWebsite] = useState(initialData.website || "");
  const [linkedinUrl, setLinkedinUrl] = useState(
    initialData.linkedinUrl || ""
  );
  const [logo, setLogo] = useState(initialData.logo || "");
  const [coverImage, setCoverImage] = useState(
    initialData.coverImage || ""
  );
  const [locations, setLocations] = useState<string[]>(() => {
    try {
      return JSON.parse(initialData.locations);
    } catch {
      return [];
    }
  });
  const [technologies, setTechnologies] = useState<string[]>(() => {
    try {
      return JSON.parse(initialData.technologies);
    } catch {
      return [];
    }
  });

  const descriptionLength = description.length;
  const maxDescription = 1000;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/company/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          industry,
          size,
          founded: founded || null,
          website: website || null,
          linkedinUrl: linkedinUrl || null,
          logo: logo || null,
          coverImage: coverImage || null,
          locations,
          technologies,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      toast.success("Company profile updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save profile"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6">
        <h3 className="font-display text-lg font-semibold text-white mb-5">Basic Information</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[13px] font-medium text-white/50">Company Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Company name"
              className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[13px] font-medium text-white/50">
              Description
              <span className="ml-2 text-[11px] text-white/30">
                {descriptionLength}/{maxDescription}
              </span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value.slice(0, maxDescription))
              }
              placeholder="Tell candidates about your company..."
              rows={4}
              className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-white/50">Industry</Label>
              <Select value={industry} onValueChange={(v) => v !== null && setIndustry(v)}>
                <SelectTrigger className="w-full rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px]">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-white/50">Company Size</Label>
              <Select value={size} onValueChange={(v) => v !== null && setSize(v)}>
                <SelectTrigger className="w-full rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px]">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="founded" className="text-[13px] font-medium text-white/50">Year Founded</Label>
            <Input
              id="founded"
              type="number"
              value={founded}
              onChange={(e) => setFounded(e.target.value)}
              placeholder="e.g. 2020"
              min={1900}
              max={new Date().getFullYear()}
              className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6">
        <h3 className="font-display text-lg font-semibold text-white mb-5">Links</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website" className="text-[13px] font-medium text-white/50">Website URL</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-[13px] font-medium text-white/50">LinkedIn URL</Label>
            <Input
              id="linkedin"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/company/..."
              className="rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6">
        <h3 className="font-display text-lg font-semibold text-white mb-5">Branding</h3>
        <div className="space-y-6">
          <ImageUploadArea
            field="logo"
            label="Company Logo"
            value={logo}
            onChange={setLogo}
            guidelines="200x200px, PNG/SVG/JPG"
            maxSize="2MB"
            previewClassName="size-20"
          />

          <Separator className="bg-white/[0.06]" />

          <ImageUploadArea
            field="cover"
            label="Cover Image"
            value={coverImage}
            onChange={setCoverImage}
            guidelines="1200x400px, JPG/PNG"
            maxSize="5MB"
            previewClassName="h-32 w-full"
          />
        </div>
      </div>

      {/* Locations & Technologies */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6">
        <h3 className="font-display text-lg font-semibold text-white mb-5">Locations & Technologies</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-white/50">Locations</Label>
            <TagInput
              tags={locations}
              onChange={setLocations}
              placeholder="Add location..."
              suggestions={LOCATION_SUGGESTIONS}
            />
          </div>

          <Separator className="bg-white/[0.06]" />

          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-white/50">Technologies</Label>
            <TagInput
              tags={technologies}
              onChange={setTechnologies}
              placeholder="Add technology..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground rounded-lg">
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
