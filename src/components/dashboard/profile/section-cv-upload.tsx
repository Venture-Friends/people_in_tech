"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, FileText, Trash2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface SectionCvUploadProps {
  cvUrl: string;
  onCvChange: (url: string) => void;
}

export function SectionCvUpload({ cvUrl, onCvChange }: SectionCvUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF and DOCX files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("cv", file);

      const res = await fetch("/api/profile/upload-cv", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const { cvUrl: url } = await res.json();
      onCvChange(url);
      toast.success("CV uploaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload CV"
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-medium text-white/70">
        <FileText className="size-4" />
        CV / Resume
      </h3>

      {cvUrl ? (
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
          <FileText className="size-5 text-emerald-400/60" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/60 truncate">{cvUrl}</p>
          </div>
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-1.5 text-white/30 hover:bg-white/[0.06] hover:text-white/60"
          >
            <ExternalLink className="size-3.5" />
          </a>
          <button
            type="button"
            onClick={() => onCvChange("")}
            className="rounded-md p-1.5 text-white/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] p-8">
          <FileUp className="size-8 text-white/15" />
          <div className="text-center">
            <p className="text-sm text-white/40">Upload your CV</p>
            <p className="text-[10px] text-white/20">PDF or DOCX, max 5MB</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <FileUp className="mr-1.5 size-3.5" />
            )}
            Choose file
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
