"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle, Loader2, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { claimSchema, type ClaimInput } from "@/lib/validations/claim";

interface ClaimCompanyModalProps {
  companyId: string;
  companyName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClaimCompanyModal({
  companyId,
  companyName,
  isOpen,
  onOpenChange,
}: ClaimCompanyModalProps) {
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClaimInput>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      companyId,
      fullName: "",
      jobTitle: "",
      workEmail: "",
      linkedinUrl: "",
      message: "",
    },
  });

  async function onSubmit(data: ClaimInput) {
    setIsLoading(true);
    setSubmitError(null);

    try {
      // Use authenticated endpoint if logged in, otherwise public endpoint
      const endpoint = isLoggedIn ? "/api/claims" : "/api/claims/public";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (isLoggedIn) {
        // Authenticated flow — check for specific errors
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));

          if (res.status === 409) {
            setSubmitError(
              "You have already submitted a claim for this company."
            );
            return;
          }
          if (res.status === 401) {
            setSubmitError("Session expired. Please sign in again.");
            return;
          }
          setSubmitError(
            body.error || "Something went wrong. Please try again."
          );
          return;
        }

        setIsSuccess(true);
        toast.success("Claim submitted successfully!");
      } else {
        // Public flow — always succeeds (anti-enumeration)
        setIsSuccess(true);
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      // Reset form state when modal is closed
      setTimeout(() => {
        reset();
        setIsSuccess(false);
        setSubmitError(null);
      }, 200);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card sm:max-w-md">
        {isSuccess ? (
          isLoggedIn ? (
            /* Authenticated success: immediate confirmation */
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="size-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Claim Submitted
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your claim request has been submitted! Our team will review it
                  within 2 business days.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="mt-2"
              >
                Close
              </Button>
            </div>
          ) : (
            /* Public success: check your email */
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/20">
                <Mail className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Check Your Email
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We&apos;ve sent a verification link to your work email. Click
                  the link to verify your claim for{" "}
                  <strong className="text-foreground">{companyName}</strong>.
                </p>
                <p className="mt-3 text-xs text-muted-foreground/70">
                  The link expires in 24 hours. If you don&apos;t see it, check
                  your spam folder.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="mt-2"
              >
                Close
              </Button>
            </div>
          )
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Claim {companyName}</DialogTitle>
              <DialogDescription>
                Verify that you represent this company to manage its profile.
                {!isLoggedIn && (
                  <span className="block mt-1">
                    We&apos;ll send a verification link to your work email.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <input type="hidden" {...register("companyId")} />

              <div>
                <Label htmlFor="claim-fullName">Full Name</Label>
                <Input
                  id="claim-fullName"
                  type="text"
                  placeholder="Jane Smith"
                  {...register("fullName")}
                  className="mt-1.5"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="claim-jobTitle">Job Title</Label>
                <Input
                  id="claim-jobTitle"
                  type="text"
                  placeholder="e.g. Head of HR"
                  {...register("jobTitle")}
                  className="mt-1.5"
                />
                {errors.jobTitle && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.jobTitle.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="claim-workEmail">Work Email</Label>
                <Input
                  id="claim-workEmail"
                  type="email"
                  placeholder="you@company.com"
                  {...register("workEmail")}
                  className="mt-1.5"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {isLoggedIn
                    ? "Must match company domain"
                    : "We'll send a verification link to this address"}
                </p>
                {errors.workEmail && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.workEmail.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="claim-linkedinUrl">
                  LinkedIn Profile{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="claim-linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  {...register("linkedinUrl")}
                  className="mt-1.5"
                />
                {errors.linkedinUrl && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.linkedinUrl.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="claim-message">
                  Message{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="claim-message"
                  placeholder="Tell us about your role at the company..."
                  {...register("message")}
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              {submitError && (
                <p className="text-sm text-destructive text-center">
                  {submitError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Claim"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
