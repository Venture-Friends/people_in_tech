"use client";

import { useState, useRef } from "react";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SKILL_CATEGORIES } from "@/lib/constants/onboarding";

interface SkillPickerProps {
  selected: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
}

const INITIAL_SHOW = 6;
const allSkills = Object.values(SKILL_CATEGORIES).flat();

export function SkillPicker({
  selected,
  onChange,
  placeholder = "Search or add a skill...",
}: SkillPickerProps) {
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
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

  function toggleGroup(group: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (search.trim()) addSkill(search);
    } else if (e.key === "Backspace" && !search && selected.length > 0) {
      removeSkill(selected[selected.length - 1]);
    }
  }

  const hasSearch = search.length > 0;
  const searchLower = search.toLowerCase();

  return (
    <div className="space-y-3">
      {/* Selected tray */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="gap-1 pr-1 text-sm h-7"
            >
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

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
        <Input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus-visible:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary/20"
        />
      </div>

      {/* Categorized skills */}
      <div className="space-y-3">
        {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => {
          const filtered = hasSearch
            ? skills.filter((s) => s.toLowerCase().includes(searchLower) && !selected.includes(s))
            : skills.filter((s) => !selected.includes(s));

          if (filtered.length === 0) return null;

          const isExpanded = expandedGroups.has(category) || hasSearch;
          const visible = isExpanded ? filtered : filtered.slice(0, INITIAL_SHOW);
          const hasMore = !isExpanded && filtered.length > INITIAL_SHOW;

          return (
            <div key={category}>
              <p className="text-[11px] uppercase tracking-wider text-white/30 mb-1.5">
                {category}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {visible.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[13px] text-white/[0.45] hover:border-white/[0.12] cursor-pointer transition-all duration-150"
                  >
                    {skill}
                  </button>
                ))}
                {hasMore && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(category)}
                    className="rounded-full px-3 py-1.5 text-[13px] text-primary/60 hover:text-primary cursor-pointer transition-colors"
                  >
                    +{filtered.length - INITIAL_SHOW} more
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Free-form hint if searching and no match */}
        {hasSearch && !allSkills.some((s) => s.toLowerCase() === searchLower) && (
          <p className="text-[11px] text-white/25">
            Press Enter to add &ldquo;{search}&rdquo; as a custom skill
          </p>
        )}
      </div>
    </div>
  );
}
