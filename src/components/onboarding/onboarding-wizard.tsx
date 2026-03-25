"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import {
  onboardingSchema,
  type OnboardingInput,
} from "@/lib/validations/onboarding";
import { Button } from "@/components/ui/button";
import { StepAbout } from "./step-about";
import { StepInterests } from "./step-interests";
import { StepPreferences } from "./step-preferences";

const STORAGE_KEY_STEP = "onboarding-step";
const STORAGE_KEY_DRAFT = "onboarding-draft";

const DEFAULT_VALUES: OnboardingInput = {
  fullName: "",
  headline: "",
  linkedinUrl: "",
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

// Which fields belong to which step
const STEP_FIELDS: Record<number, (keyof OnboardingInput)[]> = {
  1: ["fullName", "headline", "linkedinUrl", "experienceLevel"],
  2: ["roleInterests", "skills", "industries"],
  3: ["preferredLocations", "emailDigest", "emailEvents", "emailNewsletter", "language"],
};

export function OnboardingWizard() {
  const t = useTranslations("onboarding");
  const { data: session, status: sessionStatus } = useSession();
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

  // Client-side auth guard: redirect to /login if unauthenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  // Profile guard: redirect to /discover if onboarding is already complete
  useEffect(() => {
    if (sessionStatus !== "authenticated" || isSubmitting) return;

    let cancelled = false;
    fetch("/api/onboarding/status")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.onboardingComplete) {
          router.push("/discover");
        }
      })
      .catch(() => {
        // Silently ignore — user can still use the wizard
      });

    return () => {
      cancelled = true;
    };
  }, [sessionStatus, router, isSubmitting]);

  // Restore step + draft from sessionStorage after hydration (runs once)
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    try {
      const savedStep = sessionStorage.getItem(STORAGE_KEY_STEP);
      const savedDraft = sessionStorage.getItem(STORAGE_KEY_DRAFT);

      const restoredStep = savedStep ? parseInt(savedStep, 10) : 1;
      setCurrentStep(isNaN(restoredStep) || restoredStep < 1 || restoredStep > 3 ? 1 : restoredStep);

      if (savedDraft) {
        const draft = JSON.parse(savedDraft) as Partial<OnboardingInput>;
        reset({
          ...DEFAULT_VALUES,
          ...draft,
          fullName: draft.fullName || session?.user?.name || "",
        });
      } else {
        reset({
          ...DEFAULT_VALUES,
          fullName: session?.user?.name || "",
        });
      }
    } catch {
      setCurrentStep(1);
      reset({
        ...DEFAULT_VALUES,
        fullName: session?.user?.name || "",
      });
    }
  }, [reset, session?.user?.name]);

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

  const stepTitles: Record<number, string> = {
    1: t("step1Title"),
    2: t("step2Title"),
    3: t("step3Title"),
  };

  const stepSubtitles: Record<number, string> = {
    1: "Tell us about yourself",
    2: "What are you looking for?",
    3: "Almost done, set your preferences",
  };

  // Navigate freely between steps — no validation on Next (only on submit)
  function handleNext() {
    setDirection("forward");
    updateStep(Math.min((currentStep ?? 1) + 1, 3));
  }

  function handleBack() {
    setDirection("back");
    updateStep(Math.max((currentStep ?? 1) - 1, 1));
  }

  // Find first step with validation errors
  function getFirstStepWithError(errorFields: string[]): number {
    for (const step of [1, 2, 3]) {
      if (STEP_FIELDS[step].some((f) => errorFields.includes(f))) {
        return step;
      }
    }
    return 1;
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
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate all fields first
    const valid = await trigger();
    if (!valid) {
      // Find which step has the error and navigate there
      const errorFields = Object.keys(errors);
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
    handleSubmit(onSubmit)(e);
  }

  // Loading state — null step means still hydrating
  if (currentStep === null || sessionStatus === "loading") {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <Loader2 className="size-6 animate-spin text-white/30" />
      </div>
    );
  }

  const progressPercent =
    currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-[520px]">
        {/* Progress bar */}
        <div className="mb-8">
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
          <form onSubmit={handleFormSubmit}>
            {/* Render all 3 steps simultaneously — hide inactive ones with display:none */}
            <div style={{ display: currentStep === 1 ? "block" : "none" }}>
              <StepAbout
                register={register}
                watch={watch}
                setValue={setValue}
                errors={errors}
              />
            </div>

            <div style={{ display: currentStep === 2 ? "block" : "none" }}>
              <StepInterests
                watch={watch}
                setValue={setValue}
                errors={errors}
              />
            </div>

            <div style={{ display: currentStep === 3 ? "block" : "none" }}>
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

              {currentStep < 3 ? (
                <Button type="button" onClick={handleNext} size="lg">
                  {t("next")}
                  <ArrowRight className="size-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="font-display"
                >
                  {isSubmitting && (
                    <Loader2 className="size-4 mr-1 animate-spin" />
                  )}
                  {isSubmitting
                    ? t("completeSetup")
                    : "Start Exploring \u2192"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
