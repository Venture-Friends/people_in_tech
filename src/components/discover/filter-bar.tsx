"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Filters {
  industry: string;
  location: string;
  size: string;
  hasRoles: boolean;
  verified: boolean;
}

interface FilterBarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  industries?: string[];
}

const FALLBACK_INDUSTRIES = [
  "FinTech",
  "SaaS",
  "HealthTech",
  "AI/ML",
  "E-commerce",
  "EdTech",
  "Cybersecurity",
  "HR Tech",
  "PropTech",
];

const LOCATIONS = ["Athens", "Thessaloniki", "Remote"];

const SIZES = [
  { label: "Startup", value: "TINY" },
  { label: "Small", value: "SMALL" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Large", value: "LARGE" },
];

export function FilterBar({ filters, onFilterChange, industries }: FilterBarProps) {
  const t = useTranslations("discover");
  const [expanded, setExpanded] = useState(false);
  const industryList = industries && industries.length > 0 ? industries : FALLBACK_INDUSTRIES;

  const activeCount = [
    filters.industry, filters.location, filters.size,
    filters.hasRoles, filters.verified,
  ].filter(Boolean).length;

  function chipClass(active: boolean) {
    return active
      ? "rounded-full border-primary/[0.25] bg-primary/[0.05] text-primary hover:bg-primary/10"
      : "rounded-full border-white/[0.06] bg-white/[0.02] text-xs text-white/[0.45] hover:border-white/[0.12]";
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white/60 transition-colors w-fit cursor-pointer"
      >
        <SlidersHorizontal className="size-4" />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-primary/[0.1] text-primary px-2 text-[11px] font-medium">
            {activeCount}
          </span>
        )}
        {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
      </button>

      {!expanded ? null : <div className="flex flex-col gap-3 px-1 animate-in slide-in-from-top-2 duration-200">
      {/* Industry chips */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className={chipClass(filters.industry === "")}
          onClick={() => onFilterChange({ ...filters, industry: "" })}
        >
          {t("all")}
        </Button>
        {industryList.map((ind) => (
          <Button
            key={ind}
            variant="outline"
            size="sm"
            className={chipClass(filters.industry === ind)}
            onClick={() =>
              onFilterChange({
                ...filters,
                industry: filters.industry === ind ? "" : ind,
              })
            }
          >
            {ind}
          </Button>
        ))}
      </div>

      {/* Location chips */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className={chipClass(filters.location === "")}
          onClick={() => onFilterChange({ ...filters, location: "" })}
        >
          {t("all")}
        </Button>
        {LOCATIONS.map((loc) => (
          <Button
            key={loc}
            variant="outline"
            size="sm"
            className={chipClass(filters.location === loc)}
            onClick={() =>
              onFilterChange({
                ...filters,
                location: filters.location === loc ? "" : loc,
              })
            }
          >
            {loc}
          </Button>
        ))}
      </div>

      {/* Size chips */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className={chipClass(filters.size === "")}
          onClick={() => onFilterChange({ ...filters, size: "" })}
        >
          {t("all")}
        </Button>
        {SIZES.map((s) => (
          <Button
            key={s.value}
            variant="outline"
            size="sm"
            className={chipClass(filters.size === s.value)}
            onClick={() =>
              onFilterChange({
                ...filters,
                size: filters.size === s.value ? "" : s.value,
              })
            }
          >
            {s.label}
          </Button>
        ))}
      </div>

      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className={chipClass(filters.hasRoles)}
          onClick={() =>
            onFilterChange({ ...filters, hasRoles: !filters.hasRoles })
          }
        >
          {t("filterHasRoles")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={chipClass(filters.verified)}
          onClick={() =>
            onFilterChange({ ...filters, verified: !filters.verified })
          }
        >
          {t("filterVerified")}
        </Button>
      </div>
    </div>}
    </div>
  );
}
