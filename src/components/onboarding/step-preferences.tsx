"use client";

import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { useTranslations } from "next-intl";
import { MultiSelectChips } from "@/components/shared/multi-select-chips";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { OnboardingInput } from "@/lib/validations/onboarding";

interface StepPreferencesProps {
  watch: UseFormWatch<OnboardingInput>;
  setValue: UseFormSetValue<OnboardingInput>;
}

const LOCATION_OPTIONS = [
  "Athens",
  "Thessaloniki",
  "Remote",
  "Anywhere in Greece",
];

export function StepPreferences({ watch, setValue }: StepPreferencesProps) {
  const t = useTranslations("onboarding");
  const preferredLocations = watch("preferredLocations");
  const emailDigest = watch("emailDigest");
  const emailEvents = watch("emailEvents");
  const emailNewsletter = watch("emailNewsletter");
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

      <div>
        <p className="text-[13px] font-medium text-white/50 mb-4">{t("emailPreferences")}</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailDigest" className="cursor-pointer text-[13px] font-medium text-white/50">
              {t("weeklyDigest")}
            </Label>
            <Switch
              id="emailDigest"
              checked={emailDigest}
              onCheckedChange={(checked: boolean) =>
                setValue("emailDigest", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="emailEvents" className="cursor-pointer text-[13px] font-medium text-white/50">
              {t("eventAnnouncements")}
            </Label>
            <Switch
              id="emailEvents"
              checked={emailEvents}
              onCheckedChange={(checked: boolean) =>
                setValue("emailEvents", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="emailNewsletter" className="cursor-pointer text-[13px] font-medium text-white/50">
              {t("communityNewsletter")}
            </Label>
            <Switch
              id="emailNewsletter"
              checked={emailNewsletter}
              onCheckedChange={(checked: boolean) =>
                setValue("emailNewsletter", checked)
              }
            />
          </div>
        </div>
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
