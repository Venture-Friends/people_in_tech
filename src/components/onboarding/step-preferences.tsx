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
