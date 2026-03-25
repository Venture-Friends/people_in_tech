"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MultiSelectChipsProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
  groups?: Record<string, string[]>;
  max?: number;
  /** Number of items to show initially before "Show more" (0 = show all) */
  initialShow?: number;
  /** Show a search input to filter options */
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function MultiSelectChips({
  options,
  selected,
  onChange,
  label,
  groups,
  max,
  initialShow = 0,
  searchable = false,
  searchPlaceholder = "Search...",
}: MultiSelectChipsProps) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");

  function toggleOption(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      if (max && selected.length >= max) return;
      onChange([...selected, option]);
    }
  }

  const atMax = max ? selected.length >= max : false;
  const searchLower = search.toLowerCase();

  function renderChip(option: string) {
    const isSelected = selected.includes(option);
    const isDisabled = atMax && !isSelected;
    return (
      <button
        key={option}
        type="button"
        onClick={() => toggleOption(option)}
        disabled={isDisabled}
        className={cn(
          "rounded-full px-3 py-1.5 text-[13px] border cursor-pointer transition-all duration-150",
          isSelected
            ? "border-primary/[0.25] bg-primary/[0.05] text-primary"
            : "border-white/[0.06] bg-white/[0.02] text-white/[0.45] hover:border-white/[0.12]",
          isDisabled && "opacity-40 cursor-not-allowed"
        )}
      >
        {option}
      </button>
    );
  }

  // Filter options by search
  const filteredOptions = search
    ? options.filter((o) => o.toLowerCase().includes(searchLower))
    : options;

  // Filter groups by search
  const filteredGroups = groups
    ? Object.fromEntries(
        Object.entries(groups)
          .map(([name, opts]) => [
            name,
            search ? opts.filter((o) => o.toLowerCase().includes(searchLower)) : opts,
          ])
          .filter(([, opts]) => (opts as string[]).length > 0)
      )
    : null;

  // Progressive disclosure
  const showAll = expanded || search.length > 0;
  const useInitialShow = initialShow > 0 && !showAll;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-[13px] font-medium text-white/50">{label}</p>
        {max && (
          <span className={cn("text-[11px]", atMax ? "text-primary/70" : "text-white/25")}>
            {selected.length}/{max}
          </span>
        )}
      </div>

      {/* Search input */}
      {searchable && (
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/30" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8 h-8 text-[13px] rounded-[10px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus-visible:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>
      )}

      {filteredGroups ? (
        <div className="space-y-2">
          {Object.entries(filteredGroups).map(([groupName, groupOptions]) => {
            const opts = groupOptions as string[];
            const visibleOpts = useInitialShow ? opts.slice(0, initialShow) : opts;
            return (
              <div key={groupName}>
                <p className="text-[11px] uppercase tracking-wider text-white/30 mb-1">{groupName}</p>
                <div className="flex flex-wrap gap-1.5">
                  {visibleOpts.map(renderChip)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {(useInitialShow ? filteredOptions.slice(0, initialShow) : filteredOptions).map(renderChip)}
        </div>
      )}

      {/* Show more / Show less toggle */}
      {initialShow > 0 && !search && filteredOptions.length > initialShow && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-2 text-[12px] text-primary/60 hover:text-primary cursor-pointer transition-colors"
        >
          {expanded ? (
            <>Show less <ChevronUp className="size-3" /></>
          ) : (
            <>+{filteredOptions.length - initialShow} more <ChevronDown className="size-3" /></>
          )}
        </button>
      )}
    </div>
  );
}
