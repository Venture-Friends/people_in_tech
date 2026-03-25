"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ComboboxMultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
  groups?: Record<string, string[]>;
  max?: number;
  placeholder?: string;
}

export function ComboboxMultiSelect({
  options,
  selected,
  onChange,
  label,
  groups,
  max,
  placeholder = "Search and select...",
}: ComboboxMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const atMax = max ? selected.length >= max : false;
  const searchLower = search.toLowerCase();

  function toggleOption(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      if (atMax) return;
      onChange([...selected, option]);
    }
  }

  function removeOption(option: string) {
    onChange(selected.filter((s) => s !== option));
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter options
  const filteredOptions = search
    ? options.filter((o) => o.toLowerCase().includes(searchLower))
    : options;

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

  function renderOption(option: string) {
    const isSelected = selected.includes(option);
    const isDisabled = atMax && !isSelected;
    return (
      <button
        key={option}
        type="button"
        onClick={() => toggleOption(option)}
        disabled={isDisabled}
        className={cn(
          "w-full text-left px-3 py-1.5 text-[13px] rounded-lg transition-colors",
          isSelected
            ? "bg-primary/10 text-primary"
            : "text-white/60 hover:bg-white/[0.04] hover:text-white/80",
          isDisabled && "opacity-30 cursor-not-allowed"
        )}
      >
        <span className="flex items-center justify-between">
          {option}
          {isSelected && <span className="text-primary text-xs">✓</span>}
        </span>
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Label row */}
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-[13px] font-medium text-white/50">{label}</p>
        {max && (
          <span className={cn("text-[11px]", atMax ? "text-primary/70" : "text-white/25")}>
            {selected.length}/{max}
          </span>
        )}
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((item) => (
            <Badge key={item} variant="secondary" className="gap-1 pr-1 text-[13px] h-6">
              {item}
              <button
                type="button"
                onClick={() => removeOption(item)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Trigger input */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={cn(
          "w-full flex items-center gap-2 h-9 px-3 rounded-[10px] border text-[13px] transition-colors cursor-pointer",
          open
            ? "border-primary/30 ring-1 ring-primary/20 bg-white/[0.03]"
            : "border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12]"
        )}
      >
        <Search className="size-3.5 text-white/30 shrink-0" />
        <span className="text-white/30 flex-1 text-left truncate">
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
        </span>
        <ChevronDown className={cn("size-3.5 text-white/30 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Search within dropdown */}
          <div className="p-2 border-b border-white/[0.06]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/30" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to filter..."
                className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-transparent text-white/80 placeholder:text-white/25 outline-none"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-[240px] overflow-y-auto p-1.5">
            {filteredGroups ? (
              Object.entries(filteredGroups).map(([groupName, groupOptions]) => (
                <div key={groupName} className="mb-1.5 last:mb-0">
                  <p className="text-[10px] uppercase tracking-wider text-white/25 px-3 py-1">
                    {groupName}
                  </p>
                  {(groupOptions as string[]).map(renderOption)}
                </div>
              ))
            ) : (
              filteredOptions.map(renderOption)
            )}

            {(filteredGroups
              ? Object.values(filteredGroups).flat().length === 0
              : filteredOptions.length === 0) && (
              <p className="text-[12px] text-white/25 text-center py-3">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
