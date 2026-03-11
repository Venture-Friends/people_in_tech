"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/shared/tag-input";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

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
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description
              <span className="ml-2 text-xs text-muted-foreground">
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
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={industry} onValueChange={(v) => v !== null && setIndustry(v)}>
                <SelectTrigger className="w-full">
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
              <Label>Company Size</Label>
              <Select value={size} onValueChange={(v) => v !== null && setSize(v)}>
                <SelectTrigger className="w-full">
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
            <Label htmlFor="founded">Year Founded</Label>
            <Input
              id="founded"
              type="number"
              value={founded}
              onChange={(e) => setFounded(e.target.value)}
              placeholder="e.g. 2020"
              min={1900}
              max={new Date().getFullYear()}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/company/..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              type="url"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            {logo && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={logo}
                  alt="Logo preview"
                  className="size-12 rounded-lg border border-border object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  Logo preview
                </span>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image URL</Label>
            <Input
              id="cover"
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/cover.jpg"
            />
            {coverImage && (
              <div className="mt-2">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="h-32 w-full rounded-lg border border-border object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Locations & Technologies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Locations</Label>
            <TagInput
              tags={locations}
              onChange={setLocations}
              placeholder="Add location..."
              suggestions={LOCATION_SUGGESTIONS}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Technologies</Label>
            <TagInput
              tags={technologies}
              onChange={setTechnologies}
              placeholder="Add technology..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
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
