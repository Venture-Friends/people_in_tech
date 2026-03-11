"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const SORT_OPTIONS = [
  { value: "mostFollowed", labelKey: "sortMostFollowed" },
  { value: "mostRoles", labelKey: "sortMostRoles" },
  { value: "recent", labelKey: "sortRecent" },
  { value: "alphabetical", labelKey: "sortAlphabetical" },
] as const;

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const t = useTranslations("discover");

  return (
    <Select value={value} onValueChange={(v) => v !== null && onChange(v)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {t(option.labelKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
