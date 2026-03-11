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
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

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
}

export function ClaimsQueue() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/claims");
      const data = await res.json();
      setClaims(data.claims || []);
    } catch {
      toast.error("Failed to load claims");
    } finally {
      setLoading(false);
    }
  }, []);

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
    } catch {
      toast.error("Failed to reject claim");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Claim Requests
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review company ownership claims
          </p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Claim Requests
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review and process company ownership claims
        </p>
      </div>

      {claims.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="size-12 text-muted-foreground/40 mb-3" />
            <p className="text-lg font-medium text-foreground">
              No pending claims
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              All company claims have been processed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id}>
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="size-4 text-[#9fef00]" />
                      {claim.companyName}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{claim.companyIndustry}</Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400">
                    PENDING
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="my-3" />

                {/* Requester info */}
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium text-foreground">
                      {claim.fullName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Work Email:</span>
                    <span className="font-medium text-foreground">
                      {claim.workEmail}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Job Title:</span>
                    <span className="font-medium text-foreground">
                      {claim.jobTitle}
                    </span>
                  </div>
                  {claim.linkedinUrl && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">LinkedIn:</span>
                      <a
                        href={claim.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#9fef00] hover:underline truncate"
                      >
                        {claim.linkedinUrl}
                      </a>
                    </div>
                  )}
                </div>

                {claim.message && (
                  <div className="mt-3 flex items-start gap-2 text-sm">
                    <MessageSquare className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">Message: </span>
                      <span className="text-foreground">{claim.message}</span>
                    </div>
                  </div>
                )}

                <div className="mt-3 text-xs text-muted-foreground">
                  Account: {claim.userName} ({claim.userEmail})
                </div>

                <Separator className="my-3" />

                {/* Review note input (shown for reject or optionally for approve) */}
                {showRejectInput === claim.id && (
                  <div className="mb-3 space-y-1.5">
                    <Label htmlFor={`note-${claim.id}`}>
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
                      className="min-h-20"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
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
                        variant="destructive"
                        onClick={() => handleReject(claim)}
                        disabled={processingId === claim.id}
                      >
                        <XCircle className="size-4 mr-1" />
                        Confirm Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowRejectInput(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setShowRejectInput(claim.id)}
                      disabled={processingId === claim.id}
                    >
                      <XCircle className="size-4 mr-1" />
                      Reject
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
