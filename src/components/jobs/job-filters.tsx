"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface JobFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
}

const typeOptions = [
  { value: "ALL", label: "All" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "Onsite" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "company", label: "Company (A\u2013Z)" },
  { value: "location", label: "Location" },
];

function chipClass(active: boolean) {
  return active
    ? "rounded-full border-primary/[0.25] bg-primary/[0.05] text-primary hover:bg-primary/10"
    : "rounded-full border-white/[0.06] bg-white/[0.02] text-xs text-white/[0.45] hover:border-white/[0.12]";
}

export function JobFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
  sort,
  onSortChange,
}: JobFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search jobs by title, company, or location..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-12 w-full rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] pl-10 text-sm transition-all focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
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

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort:</span>
          <Select value={sort} onValueChange={(v) => v !== null && onSortChange(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
