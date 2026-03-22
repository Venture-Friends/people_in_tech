"use client";

import { cn } from "@/lib/utils";

interface MultiSelectChipsProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
  groups?: Record<string, string[]>;
  max?: number;
}

export function MultiSelectChips({
  options,
  selected,
  onChange,
  label,
  groups,
  max,
}: MultiSelectChipsProps) {
  function toggleOption(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      if (max && selected.length >= max) return;
      onChange([...selected, option]);
    }
  }

  const atMax = max ? selected.length >= max : false;

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
          "rounded-full px-4 py-2 text-sm border cursor-pointer transition-all duration-150",
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

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-[13px] font-medium text-white/50">{label}</p>
        {max && (
          <span className={cn("text-[11px]", atMax ? "text-primary/70" : "text-white/25")}>
            {selected.length}/{max}
          </span>
        )}
      </div>
      {groups ? (
        <div className="space-y-3">
          {Object.entries(groups).map(([groupName, groupOptions]) => (
            <div key={groupName}>
              <p className="text-[11px] uppercase tracking-wider text-white/30 mb-1.5">{groupName}</p>
              <div className="flex flex-wrap gap-2">
                {groupOptions.map(renderChip)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map(renderChip)}
        </div>
      )}
    </div>
  );
}
