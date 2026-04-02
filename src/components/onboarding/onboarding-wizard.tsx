"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import {
  onboardingSchema,
  type OnboardingInput,
} from "@/lib/validations/onboarding";
import { Button } from "@/components/ui/button";
import { StepEmailVerification } from "./step-email-verification";
import { StepCvUpload } from "./step-cv-upload";
import { StepAboutInterests } from "./step-about-interests";
import { StepPreferences } from "./step-preferences";
import type { ParsedCV } from "@/lib/cv-parser";

const TOTAL_STEPS = 4;
const STORAGE_KEY_STEP = "onboarding-step";
const STORAGE_KEY_DRAFT = "onboarding-draft";

const DEFAULT_VALUES: OnboardingInput = {
  fullName: "",
  headline: "",
  linkedinUrl: "",
  cvUrl: "",
  experienceLevel: "JUNIOR",
  roleInterests: [],
  skills: [],
  industries: [],
  preferredLocations: [],
  emailDigest: true,
  emailEvents: true,
  emailNewsletter: false,
  language: "en",
};

// Which fields belong to which step (steps 1 & 2 have no form fields)
const STEP_FIELDS: Record<number, (keyof OnboardingInput)[]> = {
  1: [], // Email verification — no form fields
  2: [], // CV upload — no form fields
  3: ["fullName", "headline", "linkedinUrl", "experienceLevel", "roleInterests", "skills", "industries"],
  4: ["preferredLocations", "emailDigest", "emailEvents", "emailNewsletter", "language"],
};

export function OnboardingWizard() {
  const t = useTranslations("onboarding");
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const hasRestoredRef = useRef(false);

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = form;

  // Client-side auth guard: redirect to /login if unauthenticated (only on initial load)
  const hasCheckedAuth = useRef(false);
  useEffect(() => {
    if (sessionPending) return;
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    if (!session) {
      router.push("/login");
    }
  }, [sessionPending, session, router]);

  // Restore step + draft from sessionStorage after session is loaded (runs once)
  useEffect(() => {
    if (hasRestoredRef.current || sessionPending) return;
    hasRestoredRef.current = true;

    const currentUserId = session?.user?.id;

    try {
      const savedDraft = sessionStorage.getItem(STORAGE_KEY_DRAFT);
      const savedStep = sessionStorage.getItem(STORAGE_KEY_STEP);
      const savedUser = sessionStorage.getItem("onboarding-user");

      // If no saved user or different user, clear stale data and start fresh
      if (!savedDraft || !savedUser || savedUser !== currentUserId) {
        sessionStorage.removeItem(STORAGE_KEY_STEP);
        sessionStorage.removeItem(STORAGE_KEY_DRAFT);
        sessionStorage.removeItem("onboarding-user");
        if (currentUserId) {
          sessionStorage.setItem("onboarding-user", currentUserId);
        }
        setCurrentStep(1);
        reset({
          ...DEFAULT_VALUES,
          fullName: session?.user?.name || "",
        });
        return;
      }

      // Same user — restore draft
      const restoredStep = savedStep ? parseInt(savedStep, 10) : 1;
      setCurrentStep(
        isNaN(restoredStep) || restoredStep < 1 || restoredStep > TOTAL_STEPS
          ? 1
          : restoredStep,
      );

      const draft = JSON.parse(savedDraft) as Partial<OnboardingInput>;
      reset({
        ...DEFAULT_VALUES,
        ...draft,
        fullName: draft.fullName || session?.user?.name || "",
      });
    } catch {
      setCurrentStep(1);
      reset({
        ...DEFAULT_VALUES,
        fullName: session?.user?.name || "",
      });
    }
  }, [reset, sessionPending, session?.user?.id, session?.user?.name]);

  // Auto-save to sessionStorage via watch subscription (no re-render loop)
  useEffect(() => {
    const subscription = watch((formValues) => {
      try {
        sessionStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(formValues));
      } catch {
        // Storage full or unavailable — ignore
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Persist current step
  const updateStep = useCallback((step: number) => {
    setCurrentStep(step);
    try {
      sessionStorage.setItem(STORAGE_KEY_STEP, String(step));
    } catch {
      // Ignore
    }
  }, []);

  // ── CV pre-fill helper ──

  function handleCvParsed(data: ParsedCV, fileName: string) {
    // Pre-fill form fields from parsed CV
    if (data.name) {
      setValue("fullName", data.name);
    }
    if (data.headline) {
      setValue("headline", data.headline);
    }

    // Find LinkedIn URL from links
    const linkedinLink = data.links.find((l) =>
      l.toLowerCase().includes("linkedin.com"),
    );
    if (linkedinLink) {
      setValue("linkedinUrl", linkedinLink);
    }

    // Pre-fill skills (match against known skills in our system)
    if (data.skills.length > 0) {
      setValue("skills", data.skills.slice(0, 15));
    }

    // Store the file name as cvUrl placeholder
    setValue("cvUrl", fileName);

    // Advance to next step
    setDirection("forward");
    updateStep(3);
  }

  function handleCvSkip() {
    setDirection("forward");
    updateStep(3);
  }

  function handleEmailVerified() {
    setDirection("forward");
    updateStep(2);
  }

  // ── Step navigation ──

  const stepTitles: Record<number, string> = {
    1: "Verify Email",
    2: "Upload Your CV",
    3: t("step1Title"),
    4: t("step3Title"),
  };

  const stepSubtitles: Record<number, string> = {
    1: "Confirm your email address to get started",
    2: "Upload your CV to auto-fill your profile",
    3: "Tell us about yourself and your interests",
    4: "Almost done, set your preferences",
  };

  function handleNext() {
    setDirection("forward");
    updateStep(Math.min((currentStep ?? 1) + 1, TOTAL_STEPS));
  }

  function handleBack() {
    setDirection("back");
    updateStep(Math.max((currentStep ?? 1) - 1, 1));
  }

  // Find first step with validation errors
  function getFirstStepWithError(errorFields: string[]): number {
    for (const step of [3, 4]) {
      if (STEP_FIELDS[step].some((f) => errorFields.includes(f))) {
        return step;
      }
    }
    return 3;
  }

  async function onSubmit(data: OnboardingInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to save");
      }

      // Clear sessionStorage on successful submit
      try {
        sessionStorage.removeItem(STORAGE_KEY_STEP);
        sessionStorage.removeItem(STORAGE_KEY_DRAFT);
      } catch {
        // Ignore
      }

      toast.success("Welcome!");
      router.push("/discover");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle form submit with error navigation
  async function handleFormSubmit(e?: React.FormEvent | React.MouseEvent) {
    e?.preventDefault?.();

    // Validate all fields first
    const valid = await trigger();
    if (!valid) {
      // Re-trigger to get fresh errors
      await trigger();
      const freshErrors = Object.keys(form.formState.errors);
      const errorStep = getFirstStepWithError(freshErrors);

      if (errorStep !== currentStep) {
        setDirection("back");
        updateStep(errorStep);
        toast.error(`Please fix the highlighted fields on step ${errorStep}`);
      } else {
        toast.error("Please fix the highlighted fields");
      }
      return;
    }

    // All valid — submit
    const data = form.getValues();
    onSubmit(data);
  }

  // Loading state — null step means still hydrating
  if (currentStep === null || sessionPending) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <Loader2 className="size-6 animate-spin text-white/30" />
      </div>
    );
  }

  const progressPercent = Math.round((currentStep / TOTAL_STEPS) * 100);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-[520px]">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(
              (step) => (
                <span
                  key={step}
                  className={`text-[11px] font-medium ${
                    step <= currentStep ? "text-primary" : "text-white/20"
                  }`}
                >
                  {step}
                </span>
              ),
            )}
          </div>
          <div className="h-1 w-full rounded-full bg-white/[0.06]">
            <div
              className="h-1 rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step title and subtitle */}
        <div className="mb-6">
          <h2 className="font-display text-[24px] font-bold tracking-tight">
            {stepTitles[currentStep]}
          </h2>
          <p className="mt-1 text-[15px] text-white/[0.35]">
            {stepSubtitles[currentStep]}
          </p>
        </div>

        {/* Glassmorphic card */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6 sm:p-8">
          {/* Step 1: Email Verification */}
          {currentStep === 1 && (
            <StepEmailVerification onVerified={handleEmailVerified} />
          )}

          {/* Step 2: CV Upload */}
          {currentStep === 2 && (
            <StepCvUpload
              onParsed={handleCvParsed}
              onSkip={handleCvSkip}
            />
          )}

          {/* Steps 3-4: Form-based steps */}
          {(currentStep === 3 || currentStep === 4) && (
            <form onSubmit={handleFormSubmit}>
              <div style={{ display: currentStep === 3 ? "block" : "none" }}>
                <StepAboutInterests
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                />
              </div>

              <div style={{ display: currentStep === 4 ? "block" : "none" }}>
                <StepPreferences watch={watch} setValue={setValue} />
              </div>

              <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    size="lg"
                    className="text-white/50 hover:text-white/80"
                  >
                    <ArrowLeft className="size-4 mr-1" />
                    {t("back")}
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < TOTAL_STEPS && (
                  <Button
                    key="next"
                    type="button"
                    onClick={handleNext}
                    size="lg"
                  >
                    {t("next")}
                    <ArrowRight className="size-4 ml-1" />
                  </Button>
                )}
                {currentStep === TOTAL_STEPS && (
                  <Button
                    key="submit"
                    type="button"
                    onClick={handleFormSubmit}
                    size="lg"
                    disabled={isSubmitting}
                    className="font-display"
                  >
                    {isSubmitting && (
                      <Loader2 className="size-4 mr-1 animate-spin" />
                    )}
                    {isSubmitting
                      ? t("completeSetup")
                      : "Join the Talent Pool \u2192"}
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
