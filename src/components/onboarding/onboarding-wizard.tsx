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
import { StepAbout } from "./step-about";
import { StepInterests } from "./step-interests";
import { StepPreferences } from "./step-preferences";

const TOTAL_STEPS = 3;
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
  allowContactEmail: true,
  language: "en",
};

const STEP_FIELDS: Record<number, (keyof OnboardingInput)[]> = {
  1: ["fullName", "headline", "linkedinUrl", "experienceLevel"],
  2: ["roleInterests", "skills", "industries"],
  3: ["preferredLocations", "allowContactEmail", "language"],
};

export function OnboardingWizard() {
  const t = useTranslations("onboarding");
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasRestoredRef = useRef(false);

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onSubmit",
  });

  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = form;

  // Client-side auth guard
  const hasCheckedAuth = useRef(false);
  useEffect(() => {
    if (sessionPending) return;
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    if (!session) {
      router.push("/login");
    }
  }, [sessionPending, session, router]);

  // Restore step + draft from sessionStorage
  useEffect(() => {
    if (hasRestoredRef.current || sessionPending) return;
    hasRestoredRef.current = true;

    const currentUserId = session?.user?.id;

    try {
      const savedDraft = sessionStorage.getItem(STORAGE_KEY_DRAFT);
      const savedStep = sessionStorage.getItem(STORAGE_KEY_STEP);
      const savedUser = sessionStorage.getItem("onboarding-user");

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

  // Auto-save to sessionStorage
  useEffect(() => {
    const subscription = watch((formValues) => {
      try {
        sessionStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(formValues));
      } catch {
        // Storage full or unavailable
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const updateStep = useCallback((step: number) => {
    setCurrentStep(step);
    try {
      sessionStorage.setItem(STORAGE_KEY_STEP, String(step));
    } catch {
      // Ignore
    }
  }, []);

  // Step navigation
  const stepTitles: Record<number, string> = {
    1: t("step1Title"),
    2: t("step2Title"),
    3: t("step3Title"),
  };

  const stepSubtitles: Record<number, string> = {
    1: t("step1Subtitle"),
    2: t("step2Subtitle"),
    3: t("step3Subtitle"),
  };

  function handleNext() {
    updateStep(Math.min((currentStep ?? 1) + 1, TOTAL_STEPS));
  }

  function handleBack() {
    updateStep(Math.max((currentStep ?? 1) - 1, 1));
  }

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

      try {
        sessionStorage.removeItem(STORAGE_KEY_STEP);
        sessionStorage.removeItem(STORAGE_KEY_DRAFT);
      } catch {
        // Ignore
      }

      toast.success(t("welcomeMessage") || "Welcome!");
      router.push("/discover");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFormSubmit(e?: React.FormEvent | React.MouseEvent) {
    e?.preventDefault?.();

    const valid = await trigger();
    if (!valid) {
      await trigger();
      const freshErrors = Object.keys(form.formState.errors);
      const errorStep = getFirstStepWithError(freshErrors);

      if (errorStep !== currentStep) {
        updateStep(errorStep);
        toast.error(`Please fix the highlighted fields on step ${errorStep}`);
      } else {
        toast.error("Please fix the highlighted fields");
      }
      return;
    }

    const data = form.getValues();
    onSubmit(data);
  }

  // Loading state
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
        <form
          onSubmit={handleFormSubmit}
          className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6 sm:p-8"
        >
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

            {currentStep < TOTAL_STEPS && (
              <Button
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
                  : t("joinTalentPool")}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
