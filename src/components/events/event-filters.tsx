"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface EventFiltersProps {
  type: string;
  onTypeChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  online: string;
  onOnlineChange: (value: string) => void;
}

function chipClass(active: boolean) {
  return active
    ? "border-primary text-primary bg-transparent hover:bg-primary/10"
    : "bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:border-white/[0.12]";
}

export function EventFilters({
  type,
  onTypeChange,
  dateRange,
  onDateRangeChange,
  online,
  onOnlineChange,
}: EventFiltersProps) {
  const t = useTranslations("events");

  const typeOptions = [
    { value: "ALL", label: "All" },
    { value: "WORKSHOP", label: t("workshops") },
    { value: "MEETUP", label: t("meetups") },
    { value: "WEBINAR", label: t("webinars") },
    { value: "TALENT_SESSION", label: t("talentSessions") },
  ];

  const dateOptions = [
    { value: "upcoming", label: t("upcoming") },
    { value: "thisWeek", label: t("thisWeek") },
    { value: "thisMonth", label: t("thisMonth") },
  ];

  const locationOptions = [
    { value: "", label: "All" },
    { value: "true", label: t("online") },
    { value: "false", label: "In-Person" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Type filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {typeOptions.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            size="sm"
            onClick={() => onTypeChange(option.value)}
            className={cn("rounded-full text-xs", chipClass(type === option.value))}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Date range filter */}
        <div className="flex items-center gap-2">
          {dateOptions.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              onClick={() => onDateRangeChange(option.value)}
              className={cn("rounded-full text-xs", chipClass(dateRange === option.value))}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Online / In-Person toggle */}
        <div className="flex items-center gap-2">
          {locationOptions.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              onClick={() => onOnlineChange(option.value)}
              className={cn("rounded-full text-xs", chipClass(online === option.value))}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
