"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ParsedCV } from "@/lib/cv-parser";

interface StepCvUploadProps {
  onParsed: (data: ParsedCV, fileName: string) => void;
  onSkip: () => void;
}

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function StepCvUpload({ onParsed, onSkip }: StepCvUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedCV | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(f: File): boolean {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error("Please upload a PDF or DOCX file.");
      return false;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 5 MB.");
      return false;
    }
    return true;
  }

  async function handleFile(f: File) {
    if (!validateFile(f)) return;

    setFile(f);
    setParsing(true);
    setParsed(null);

    try {
      const formData = new FormData();
      formData.append("file", f);

      const res = await fetch("/api/onboarding/parse-cv", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to parse CV");
      }

      const { data } = await res.json();
      setParsed(data);
      toast.success("CV parsed successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to parse CV",
      );
      setFile(null);
    } finally {
      setParsing(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove() {
    setFile(null);
    setParsed(null);
  }

  function handleContinue() {
    if (parsed && file) {
      onParsed(parsed, file.name);
    }
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      {!file && (
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all",
            dragOver
              ? "border-primary/40 bg-primary/[0.05]"
              : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]",
          )}
        >
          <Upload className="size-8 text-white/30 mb-3" />
          <p className="text-[14px] font-medium text-white/60 mb-1">
            Drop your CV here or click to browse
          </p>
          <p className="text-[12px] text-white/30">
            PDF or DOCX, max 5 MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* File info + parsing state */}
      {file && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <FileText className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white/70 truncate">
                {file.name}
              </p>
              <p className="text-[11px] text-white/30">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
            {parsing ? (
              <Loader2 className="size-5 animate-spin text-primary" />
            ) : parsed ? (
              <CheckCircle className="size-5 text-primary" />
            ) : null}
            {!parsing && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Parsed preview */}
      {parsed && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-3">
          <p className="text-[12px] font-medium uppercase tracking-wider text-white/30">
            Extracted from CV
          </p>

          {parsed.name && (
            <PreviewRow label="Name" value={parsed.name} />
          )}
          {parsed.headline && (
            <PreviewRow label="Headline" value={parsed.headline} />
          )}
          {parsed.email && (
            <PreviewRow label="Email" value={parsed.email} />
          )}
          {parsed.skills.length > 0 && (
            <PreviewRow
              label="Skills"
              value={parsed.skills.slice(0, 8).join(", ")}
            />
          )}
          {parsed.experience.length > 0 && (
            <PreviewRow
              label="Experience"
              value={`${parsed.experience.length} entries found`}
            />
          )}
          {parsed.education.length > 0 && (
            <PreviewRow
              label="Education"
              value={`${parsed.education.length} entries found`}
            />
          )}
          {parsed.languages.length > 0 && (
            <PreviewRow
              label="Languages"
              value={parsed.languages.join(", ")}
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          size="lg"
          className="text-white/50 hover:text-white/80"
        >
          <SkipForward className="size-4 mr-1" />
          Skip
        </Button>

        {parsed && (
          <Button type="button" onClick={handleContinue} size="lg">
            Use CV Data
          </Button>
        )}
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-[12px] text-white/40 w-20 shrink-0">{label}</span>
      <span className="text-[13px] text-white/70 truncate">{value}</span>
    </div>
  );
}
