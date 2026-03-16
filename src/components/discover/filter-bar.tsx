"use client";

import { useTranslations } from "next-intl";
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
}

const INDUSTRIES = [
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

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const t = useTranslations("discover");

  function chipClass(active: boolean) {
    return active
      ? "rounded-full border-primary/[0.25] bg-primary/[0.05] text-primary hover:bg-primary/10"
      : "rounded-full border-white/[0.06] bg-white/[0.02] text-xs text-white/[0.45] hover:border-white/[0.12]";
  }

  return (
    <div className="flex flex-col gap-3">
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
        {INDUSTRIES.map((ind) => (
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
    </div>
  );
}
