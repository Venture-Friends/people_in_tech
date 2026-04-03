"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle, Loader2, Building2, AlertTriangle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const listCompanySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  website: z.string().url("Please enter a valid URL").or(z.literal("")),
  contactEmail: z.string().email("Please enter a valid email"),
  contactPhone: z.string().optional(),
  yourRole: z.string().min(2, "Please describe your role"),
  message: z.string().optional(),
});

type ListCompanyInput = z.infer<typeof listCompanySchema>;

export function ListCompanyForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [existingCompany, setExistingCompany] = useState<{
    name: string;
    slug: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListCompanyInput>({
    resolver: zodResolver(listCompanySchema),
    defaultValues: {
      companyName: "",
      website: "",
      contactEmail: "",
      contactPhone: "",
      yourRole: "",
      message: "",
    },
  });

  async function onSubmit(data: ListCompanyInput) {
    setIsLoading(true);
    setExistingCompany(null);
    try {
      // For MVP: create a placeholder company (PENDING status) and attach a claim
      const res = await fetch("/api/companies/list-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));

        if (res.status === 409 && body.error === "COMPANY_EXISTS") {
          setExistingCompany(body.existingCompany);
          return;
        }

        toast.error(body.error || "Something went wrong. Please try again.");
        return;
      }

      setIsSuccess(true);
      toast.success("Request submitted!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-10 text-center max-w-[480px] mx-auto">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/[0.1]">
          <CheckCircle className="size-7 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Request Submitted
          </h2>
          <p className="mt-2 text-[14px] text-white/[0.35] max-w-sm">
            Thanks for your interest! Our team will review your request and get back to you within 2 business days.
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" className="border-white/[0.08]">
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[520px] mx-auto">
      <div className="text-center mb-8">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/[0.1] mx-auto mb-4">
          <Building2 className="size-6 text-primary" />
        </div>
        <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
          List Your Company
        </h1>
        <p className="text-[15px] text-white/[0.35] mt-2 max-w-md mx-auto">
          Get your company featured on the platform. Reach candidates in Greek tech.
        </p>
      </div>

      {existingCompany && (
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] backdrop-blur-[8px] p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-amber-400 mt-0.5 shrink-0" />
            <div className="text-[14px] text-white/60">
              <p>
                <span className="font-semibold text-white/90">{existingCompany.name}</span>{" "}
                is already listed on our platform.
              </p>
              <p className="mt-2">
                Visit the{" "}
                <Link
                  href={`/companies/${existingCompany.slug}`}
                  className="text-primary font-medium hover:underline"
                >
                  company page
                </Link>{" "}
                and use the <span className="font-medium text-white/80">&quot;Claim this company&quot;</span> feature
                to request ownership.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="companyName" className="text-[13px] font-medium text-white/50">
              Company Name
            </Label>
            <Input
              id="companyName"
              type="text"
              placeholder="e.g. Acme Technologies"
              {...register("companyName")}
              className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] px-3.5 py-2.5 text-foreground placeholder:text-white/20 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-destructive">{errors.companyName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="website" className="text-[13px] font-medium text-white/50">
              Website
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://yourcompany.com"
              {...register("website")}
              className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] px-3.5 py-2.5 text-foreground placeholder:text-white/20 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
            />
            {errors.website && (
              <p className="mt-1 text-sm text-destructive">{errors.website.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contactEmail" className="text-[13px] font-medium text-white/50">
              Contact Email
            </Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="you@company.com"
              {...register("contactEmail")}
              className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] px-3.5 py-2.5 text-foreground placeholder:text-white/20 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
            />
            {errors.contactEmail && (
              <p className="mt-1 text-sm text-destructive">{errors.contactEmail.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contactPhone" className="text-[13px] font-medium text-white/50">
              Phone <span className="text-white/20 font-normal">(optional)</span>
            </Label>
            <Input
              id="contactPhone"
              type="tel"
              placeholder="+30 ..."
              {...register("contactPhone")}
              className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] px-3.5 py-2.5 text-foreground placeholder:text-white/20 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div>
            <Label htmlFor="yourRole" className="text-[13px] font-medium text-white/50">
              Your Role at the Company
            </Label>
            <Input
              id="yourRole"
              type="text"
              placeholder="e.g. Head of HR, CTO, Founder"
              {...register("yourRole")}
              className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] px-3.5 py-2.5 text-foreground placeholder:text-white/20 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
            />
            {errors.yourRole && (
              <p className="mt-1 text-sm text-destructive">{errors.yourRole.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="message" className="text-[13px] font-medium text-white/50">
              Message <span className="text-white/20 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Tell us about your company and why you'd like to be listed..."
              {...register("message")}
              className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] px-3.5 py-2.5 text-foreground placeholder:text-white/20 focus:border-primary/30 focus:ring-1 focus:ring-primary/20 min-h-[100px]"
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Submit Request"
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-white/20">
          Already on the platform?{" "}
          <Link href="/discover" className="text-primary hover:underline">
            Find and claim your company page
          </Link>
        </p>
      </div>
    </div>
  );
}
