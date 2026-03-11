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
      <p className="text-sm font-medium mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={cn(
                "rounded-full px-4 py-2 text-sm border cursor-pointer transition-all",
                isSelected
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-muted border-border text-muted-foreground hover:border-foreground/30"
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
