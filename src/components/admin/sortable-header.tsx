"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

type SortDirection = "asc" | "desc" | null;

interface SortState<K extends string> {
  key: K | null;
  direction: SortDirection;
}

export function useSortableTable<T, K extends string>(
  data: T[],
  getters: Record<K, (item: T) => string | number | boolean | null | undefined>
) {
  const [sort, setSort] = useState<SortState<K>>({ key: null, direction: null });

  const toggle = useCallback((key: K) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: null };
    });
  }, []);

  const sorted = useMemo(() => {
    if (!sort.key || !sort.direction) return data;
    const getter = getters[sort.key];
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...data].sort((a, b) => {
      const va = getter(a);
      const vb = getter(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "string" && typeof vb === "string")
        return va.localeCompare(vb) * dir;
      if (typeof va === "boolean" && typeof vb === "boolean")
        return (Number(va) - Number(vb)) * dir;
      return (Number(va) - Number(vb)) * dir;
    });
  }, [data, sort, getters]);

  return { sorted, sort, toggle };
}

interface SortableHeadProps<K extends string> {
  label: string;
  sortKey: K;
  currentKey: K | null;
  direction: SortDirection;
  onToggle: (key: K) => void;
  className?: string;
}

export function SortableHead<K extends string>({
  label,
  sortKey,
  currentKey,
  direction,
  onToggle,
  className = "",
}: SortableHeadProps<K>) {
  const isActive = currentKey === sortKey;

  return (
    <TableHead
      className={`text-[11px] uppercase tracking-wider bg-white/[0.02] cursor-pointer select-none hover:text-white/50 transition-colors ${isActive ? "text-white/50" : "text-white/30"} ${className}`}
      onClick={() => onToggle(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && direction === "asc" && <ChevronUp className="size-3" />}
        {isActive && direction === "desc" && <ChevronDown className="size-3" />}
        {!isActive && <ChevronsUpDown className="size-3 opacity-0 group-hover:opacity-100" />}
      </span>
    </TableHead>
  );
}
