# PR F: Onboarding Revert to Original 3-Step — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revert onboarding to the original 3-step flow (About → Interests → Preferences) with a single "Allow companies to contact me" toggle replacing the three email toggles.

**Architecture:** Rewrite the wizard to use 3 form-based steps, create a new step-preferences component, update the validation schema and API route to use `allowContactEmail` instead of three booleans, add the field to Prisma schema, delete the email verification banner.

**Tech Stack:** Next.js 16, React 19, react-hook-form, Zod, Prisma, next-intl

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `prisma/schema.prisma` | Add `allowContactEmail` to CandidateProfile |
| Modify | `src/lib/validations/onboarding.ts` | Replace 3 email booleans with `allowContactEmail` |
| Modify | `src/app/api/onboarding/route.ts` | Persist `allowContactEmail` |
| Create | `src/components/onboarding/step-preferences.tsx` | Step 3: locations, contact toggle, language |
| Modify | `src/components/onboarding/onboarding-wizard.tsx` | 3-step wizard with form-based steps |
| Delete | `src/components/shared/email-verification-banner.tsx` | No longer needed |
| Modify | `src/app/[locale]/(main)/dashboard/candidate/page.tsx` | Remove banner import/render |

---

### Task 1: Add allowContactEmail to schema and push

**Files:**
- Modify: `prisma/schema.prisma` (CandidateProfile model, around line 46)

- [ ] **Step 1: Add the field**

In `prisma/schema.prisma`, add to the CandidateProfile model (after the `emailNewsletter` field):

```prisma
  allowContactEmail Boolean @default(true)
```

- [ ] **Step 2: Push schema**

```bash
npx prisma db push
npx prisma generate
```

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "schema: add allowContactEmail to CandidateProfile"
```

---

### Task 2: Update validation schema and API route

**Files:**
- Modify: `src/lib/validations/onboarding.ts`
- Modify: `src/app/api/onboarding/route.ts`

- [ ] **Step 1: Update validation schema**

Replace the entire content of `src/lib/validations/onboarding.ts`:

```typescript
import { z } from "zod";

export const onboardingSchema = z.object({
  fullName: z.string().min(2),
  headline: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  experienceLevel: z.enum([
    "STUDENT", "JUNIOR", "MID", "SENIOR", "LEAD",
    "MANAGER", "DIRECTOR",
  ]),
  roleInterests: z.array(z.string()).min(1, "Select at least one").max(5, "Select up to 5"),
  skills: z.array(z.string()),
  industries: z.array(z.string()),
  preferredLocations: z.array(z.string()),
  allowContactEmail: z.boolean(),
  language: z.enum(["en", "el"]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
```

- [ ] **Step 2: Update API route**

Replace the entire content of `src/app/api/onboarding/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { getSession } from "@/lib/auth-session";

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = onboardingSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.issues },
      { status: 400 }
    );
  }

  const data = result.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.fullName,
      locale: data.language,
      linkedinUrl: data.linkedinUrl || null,
    },
  });

  await prisma.candidateProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      headline: data.headline || null,
      experienceLevel: data.experienceLevel,
      skills: JSON.stringify(data.skills),
      roleInterests: JSON.stringify(data.roleInterests),
      industries: JSON.stringify(data.industries),
      preferredLocations: JSON.stringify(data.preferredLocations),
      allowContactEmail: data.allowContactEmail,
      onboardingComplete: true,
    },
    update: {
      headline: data.headline || null,
      experienceLevel: data.experienceLevel,
      skills: JSON.stringify(data.skills),
      roleInterests: JSON.stringify(data.roleInterests),
      industries: JSON.stringify(data.industries),
      preferredLocations: JSON.stringify(data.preferredLocations),
      allowContactEmail: data.allowContactEmail,
      onboardingComplete: true,
    },
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/validations/onboarding.ts src/app/api/onboarding/route.ts
git commit -m "feat: replace email toggles with allowContactEmail in onboarding"
```

---

### Task 3: Create step-preferences component

**Files:**
- Create: `src/components/onboarding/step-preferences.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/onboarding/step-preferences.tsx`:

```typescript
"use client";

import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { useTranslations } from "next-intl";
import { MultiSelectChips } from "@/components/shared/multi-select-chips";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LOCATION_OPTIONS } from "@/lib/constants/onboarding";
import type { OnboardingInput } from "@/lib/validations/onboarding";

interface StepPreferencesProps {
  watch: UseFormWatch<OnboardingInput>;
  setValue: UseFormSetValue<OnboardingInput>;
}

export function StepPreferences({ watch, setValue }: StepPreferencesProps) {
  const t = useTranslations("onboarding");
  const preferredLocations = watch("preferredLocations");
  const allowContactEmail = watch("allowContactEmail");
  const language = watch("language");

  return (
    <div className="space-y-6">
      <div>
        <MultiSelectChips
          label={t("preferredLocation")}
          options={LOCATION_OPTIONS}
          selected={preferredLocations || []}
          onChange={(selected) => setValue("preferredLocations", selected)}
        />
      </div>

      <Separator className="border-white/[0.04]" />

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="allowContactEmail" className="cursor-pointer text-[13px] font-medium text-white/50">
            {t("allowContactEmail")}
          </Label>
          <p className="text-[11px] text-white/25 mt-0.5">
            {t("allowContactEmailDesc")}
          </p>
        </div>
        <Switch
          id="allowContactEmail"
          checked={allowContactEmail}
          onCheckedChange={(checked: boolean) =>
            setValue("allowContactEmail", checked)
          }
        />
      </div>

      <Separator className="border-white/[0.04]" />

      <div>
        <p className="text-[13px] font-medium text-white/50 mb-3">{t("languagePreference")}</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue("language", "en")}
            className={cn(
              "rounded-2xl border p-4 text-center cursor-pointer transition-all",
              language === "en"
                ? "border-primary/[0.25] bg-primary/[0.05] text-primary"
                : "border-white/[0.05] bg-white/[0.02] text-white/40 hover:border-white/[0.1]"
            )}
          >
            <span className="text-lg block mb-1">EN</span>
            <span className="text-sm">English</span>
          </button>
          <button
            type="button"
            onClick={() => setValue("language", "el")}
            className={cn(
              "rounded-2xl border p-4 text-center cursor-pointer transition-all",
              language === "el"
                ? "border-primary/[0.25] bg-primary/[0.05] text-primary"
                : "border-white/[0.05] bg-white/[0.02] text-white/40 hover:border-white/[0.1]"
            )}
          >
            <span className="text-lg block mb-1">EL</span>
            <span className="text-sm">{"\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add i18n keys**

In `src/messages/en.json`, add to the `"onboarding"` section:
```json
"allowContactEmail": "Allow companies to contact me via email",
"allowContactEmailDesc": "Companies you express interest in can reach out to you"
```

In `src/messages/el.json`, add to the `"onboarding"` section:
```json
"allowContactEmail": "Επιτρέψτε στις εταιρείες να επικοινωνήσουν μαζί μου",
"allowContactEmailDesc": "Εταιρείες στις οποίες εκδηλώνεις ενδιαφέρον μπορούν να σε βρουν"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/step-preferences.tsx src/messages/en.json src/messages/el.json
git commit -m "feat: add step-preferences with contact toggle and language selector"
```

---

### Task 4: Rewrite onboarding wizard for 3 form-based steps

**Files:**
- Modify: `src/components/onboarding/onboarding-wizard.tsx`

- [ ] **Step 1: Rewrite the wizard**

Replace the entire content of `src/components/onboarding/onboarding-wizard.tsx`:

```typescript
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
```

- [ ] **Step 2: Add missing i18n keys**

In `src/messages/en.json` `"onboarding"` section, ensure these exist:
```json
"step3Subtitle": "Almost done, set your preferences",
"joinTalentPool": "Join the Talent Pool"
```

In `src/messages/el.json` `"onboarding"` section:
```json
"step3Subtitle": "Σχεδόν τελειώσαμε, ρύθμισε τις προτιμήσεις σου",
"joinTalentPool": "Γίνε μέλος"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/onboarding-wizard.tsx src/messages/en.json src/messages/el.json
git commit -m "feat: rewrite onboarding wizard to original 3-step flow"
```

---

### Task 5: Delete old components and clean up dashboard

**Files:**
- Delete: `src/components/shared/email-verification-banner.tsx`
- Delete: `src/components/onboarding/step-cv-upload.tsx`
- Modify: `src/app/[locale]/(main)/dashboard/candidate/page.tsx`

- [ ] **Step 1: Delete files**

```bash
rm src/components/shared/email-verification-banner.tsx
rm src/components/onboarding/step-cv-upload.tsx
```

- [ ] **Step 2: Remove banner from dashboard**

In `src/app/[locale]/(main)/dashboard/candidate/page.tsx`:
- Delete the import: `import { EmailVerificationBanner } from "@/components/shared/email-verification-banner";`
- Delete the render: `<EmailVerificationBanner />`

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```
Ignore pre-existing switch.tsx error.

- [ ] **Step 4: Commit**

```bash
git add -u
git commit -m "chore: delete email verification banner and CV upload step"
```
