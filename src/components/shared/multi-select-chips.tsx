"use client";

import { cn } from "@/lib/utils";

interface MultiSelectChipsProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
}

export function MultiSelectChips({
  options,
  selected,
  onChange,
  label,
}: MultiSelectChipsProps) {
  function toggleOption(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div>
      <p className="text-[13px] font-medium text-white/50 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={cn(
                "rounded-full px-4 py-2 text-sm border cursor-pointer transition-all duration-150",
                isSelected
                  ? "border-primary/[0.25] bg-primary/[0.05] text-primary"
                  : "border-white/[0.06] bg-white/[0.02] text-white/[0.45] hover:border-white/[0.12]"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
