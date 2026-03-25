"use client";

import { useState, useRef, useEffect } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SKILL_CATEGORIES } from "@/lib/constants/onboarding";

interface SkillPickerProps {
  selected: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
}

const allSkills = Object.values(SKILL_CATEGORIES).flat();

export function SkillPicker({
  selected,
  onChange,
  placeholder = "Search or add a skill...",
}: SkillPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addSkill(skill: string) {
    const trimmed = skill.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setSearch("");
  }

  function removeSkill(skill: string) {
    onChange(selected.filter((s) => s !== skill));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (search.trim()) addSkill(search);
    } else if (e.key === "Backspace" && !search && selected.length > 0) {
      removeSkill(selected[selected.length - 1]);
    }
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

  const searchLower = search.toLowerCase();
  const hasSearch = search.length > 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1 pr-1 text-[13px] h-6">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Trigger */}
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
          {selected.length === 0 ? placeholder : `${selected.length} skills selected`}
        </span>
        <ChevronDown className={cn("size-3.5 text-white/30 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Search input inside dropdown */}
          <div className="p-2 border-b border-white/[0.06]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/30" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type to search or add custom..."
                className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-transparent text-white/80 placeholder:text-white/25 outline-none"
              />
            </div>
          </div>

          {/* Categorized skills */}
          <div className="max-h-[240px] overflow-y-auto p-1.5">
            {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => {
              const filtered = hasSearch
                ? skills.filter((s) => s.toLowerCase().includes(searchLower) && !selected.includes(s))
                : skills.filter((s) => !selected.includes(s));

              if (filtered.length === 0) return null;

              return (
                <div key={category} className="mb-1.5 last:mb-0">
                  <p className="text-[10px] uppercase tracking-wider text-white/25 px-3 py-1">
                    {category}
                  </p>
                  {filtered.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="w-full text-left px-3 py-1.5 text-[13px] text-white/60 hover:bg-white/[0.04] hover:text-white/80 rounded-lg transition-colors"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              );
            })}

            {/* Free-form hint */}
            {hasSearch && !allSkills.some((s) => s.toLowerCase() === searchLower) && (
              <p className="text-[11px] text-white/30 text-center py-2">
                Press Enter to add &ldquo;{search}&rdquo;
              </p>
            )}

            {hasSearch && allSkills.filter((s) => s.toLowerCase().includes(searchLower) && !selected.includes(s)).length === 0 &&
              allSkills.some((s) => s.toLowerCase() === searchLower) && (
              <p className="text-[12px] text-white/25 text-center py-3">No more matches</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
