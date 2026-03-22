"use client";

import { useState } from "react";
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

export function OnboardingWizard() {
  const t = useTranslations("onboarding");
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: session?.user?.name || "",
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
    },
  });

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

  async function handleNext() {
    if (currentStep === 1) {
      const valid = await trigger(["fullName", "headline", "linkedinUrl", "experienceLevel"]);
      if (!valid) return;
    } else if (currentStep === 2) {
      const valid = await trigger(["roleInterests", "skills", "industries"]);
      if (!valid) return;
    }
    setDirection("forward");
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  }

  function handleBack() {
    setDirection("back");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
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

      toast.success("Welcome!");
      router.push("/discover");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const progressPercent = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;

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
          <form onSubmit={handleSubmit(onSubmit)}>
            <div key={currentStep} className={direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"}>
              {currentStep === 1 && (
                <StepAbout
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                />
              )}

              {currentStep === 2 && (
                <StepInterests
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                />
              )}

              {currentStep === 3 && (
                <StepPreferences watch={watch} setValue={setValue} />
              )}
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
                  {isSubmitting ? t("completeSetup") : "Start Exploring \u2192"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
