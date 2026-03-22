"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Building2,
  User,
  Mail,
  Briefcase,
  Linkedin,
  MessageSquare,
  Clock,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

interface Claim {
  id: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  companyIndustry: string;
  userId: string;
  userName: string;
  userEmail: string;
  fullName: string;
  jobTitle: string;
  workEmail: string;
  linkedinUrl: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  reviewerName: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
}

export function ClaimsQueue({ onClaimProcessed }: { onClaimProcessed?: () => void }) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ClaimStatus>("PENDING");

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/claims?status=${statusFilter}`);
      const data = await res.json();
      setClaims(data.claims || []);
    } catch {
      toast.error("Failed to load claims");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleApprove = async (claim: Claim) => {
    setProcessingId(claim.id);
    try {
      const res = await fetch(`/api/admin/claims/${claim.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          reviewNote: reviewNotes[claim.id] || "",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to approve claim");
        return;
      }

      toast.success(
        `Claim approved! ${claim.companyName} is now verified and ${claim.fullName} is a Company Rep.`
      );
      setClaims((prev) => prev.filter((c) => c.id !== claim.id));
      onClaimProcessed?.();
    } catch {
      toast.error("Failed to approve claim");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (claim: Claim) => {
    const note = reviewNotes[claim.id];
    if (!note || note.trim().length === 0) {
      toast.error("A reason is required when rejecting a claim");
      return;
    }

    setProcessingId(claim.id);
    try {
      const res = await fetch(`/api/admin/claims/${claim.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          reviewNote: note,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to reject claim");
        return;
      }

      toast.success(`Claim for ${claim.companyName} has been rejected.`);
      setClaims((prev) => prev.filter((c) => c.id !== claim.id));
      setShowRejectInput(null);
      onClaimProcessed?.();
    } catch {
      toast.error("Failed to reject claim");
    } finally {
      setProcessingId(null);
    }
  };

  const statusOptions: { value: ClaimStatus; label: string }[] = [
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
    { value: "ALL", label: "All" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Claim Requests
        </h2>
        <p className="text-sm text-white/[0.35] mt-1">
          Review and process company ownership claims
        </p>
      </div>

      {/* Status filter chips */}
      <div className="flex items-center gap-2">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
              statusFilter === opt.value
                ? "border-primary/25 bg-primary/5 text-primary"
                : "border-white/[0.06] bg-white/[0.02] text-white/[0.45] hover:border-white/[0.12]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <CheckCircle className="size-12 text-primary/40 mb-3" />
            <p className="text-lg font-medium text-foreground">
              {statusFilter === "PENDING"
                ? "No pending claims"
                : statusFilter === "ALL"
                  ? "No claims found"
                  : `No ${statusFilter.toLowerCase()} claims`}
            </p>
            <p className="text-sm text-white/[0.35] mt-1">
              {statusFilter === "PENDING"
                ? "All company claims have been processed."
                : "No claims match the selected filter."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="size-4 text-primary" />
                    {claim.companyName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-white/[0.05] text-white/[0.35]">
                      {claim.companyIndustry}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-white/30">
                      <Clock className="size-3" />
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                    claim.status === "APPROVED"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : claim.status === "REJECTED"
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {claim.status}
                </span>
              </div>

              <div className="h-px bg-white/[0.04] my-3" />

              {/* Requester info */}
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-white/30 shrink-0" />
                  <span className="text-white/30">Name:</span>
                  <span className="font-medium text-foreground">
                    {claim.fullName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-white/30 shrink-0" />
                  <span className="text-white/30">Work Email:</span>
                  <span className="font-medium text-foreground">
                    {claim.workEmail}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="size-4 text-white/30 shrink-0" />
                  <span className="text-white/30">Job Title:</span>
                  <span className="font-medium text-foreground">
                    {claim.jobTitle}
                  </span>
                </div>
                {claim.linkedinUrl && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="size-4 text-white/30 shrink-0" />
                    <span className="text-white/30">LinkedIn:</span>
                    <a
                      href={claim.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {claim.linkedinUrl}
                    </a>
                  </div>
                )}
              </div>

              {claim.message && (
                <div className="mt-3 flex items-start gap-2 text-sm">
                  <MessageSquare className="size-4 text-white/30 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white/30">Message: </span>
                    <span className="text-foreground">{claim.message}</span>
                  </div>
                </div>
              )}

              <div className="mt-3 text-xs text-white/30">
                Account: {claim.userName} ({claim.userEmail})
              </div>

              <div className="h-px bg-white/[0.04] my-3" />

              {claim.status !== "PENDING" ? (
                /* Review details for processed claims */
                <div className="space-y-2 text-sm">
                  {claim.reviewerName && (
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-white/30 shrink-0" />
                      <span className="text-white/30">Reviewed by:</span>
                      <span className="font-medium text-foreground">{claim.reviewerName}</span>
                    </div>
                  )}
                  {claim.reviewedAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-white/30 shrink-0" />
                      <span className="text-white/30">Reviewed:</span>
                      <span className="text-foreground">
                        {new Date(claim.reviewedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                  {claim.reviewNote && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="size-4 text-white/30 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-white/30">Note: </span>
                        <span className="text-foreground">{claim.reviewNote}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Review note input (shown for reject or optionally for approve) */}
                  {showRejectInput === claim.id && (
                    <div className="mb-3 space-y-1.5">
                      <Label htmlFor={`note-${claim.id}`} className="text-white/[0.35] text-xs">
                        Rejection Reason <span className="text-red-400">*</span>
                      </Label>
                      <Textarea
                        id={`note-${claim.id}`}
                        value={reviewNotes[claim.id] || ""}
                        onChange={(e) =>
                          setReviewNotes((prev) => ({
                            ...prev,
                            [claim.id]: e.target.value,
                          }))
                        }
                        placeholder="Explain why this claim is being rejected..."
                        className="min-h-20 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground rounded-lg"
                      onClick={() => handleApprove(claim)}
                      disabled={processingId === claim.id}
                    >
                      <CheckCircle2 className="size-4 mr-1" />
                      Approve
                    </Button>

                    {showRejectInput === claim.id ? (
                      <>
                        <Button
                          size="sm"
                          className="border border-red-400/30 text-red-400 hover:bg-red-400/10 rounded-lg bg-transparent"
                          onClick={() => handleReject(claim)}
                          disabled={processingId === claim.id}
                        >
                          <XCircle className="size-4 mr-1" />
                          Confirm Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white/30 hover:text-white/60 rounded-lg"
                          onClick={() => setShowRejectInput(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="border border-red-400/30 text-red-400 hover:bg-red-400/10 rounded-lg bg-transparent"
                        onClick={() => setShowRejectInput(claim.id)}
                        disabled={processingId === claim.id}
                      >
                        <XCircle className="size-4 mr-1" />
                        Reject
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
