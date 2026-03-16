"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { SearchBar } from "./search-bar";
import { FilterBar, type Filters } from "./filter-bar";
import { SortDropdown } from "./sort-dropdown";
import { CompanyGrid } from "./company-grid";
import type { CompanyCardData } from "@/components/shared/company-card";
import { PageHeader } from "@/components/shared/page-header";

interface CompanyApiResponse {
  companies: CompanyCardData[];
  total: number;
}

interface DiscoverClientProps {
  initialCompanies: CompanyCardData[];
  initialTotal: number;
  industries?: string[];
}

export function DiscoverClient({
  initialCompanies,
  initialTotal,
  industries,
}: DiscoverClientProps) {
  const t = useTranslations("discover");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize state from URL params
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState<Filters>({
    industry: searchParams.get("industry") || "",
    location: searchParams.get("location") || "",
    size: searchParams.get("size") || "",
    hasRoles: searchParams.get("hasRoles") === "true",
    verified: searchParams.get("verified") === "true",
  });
  const [sort, setSort] = useState(
    searchParams.get("sort") || "mostFollowed"
  );
  const [companies, setCompanies] =
    useState<CompanyCardData[]>(initialCompanies);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  // Track whether this is the first render (skip initial fetch)
  const isInitialMount = useRef(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build query string from current state
  const buildQueryString = useCallback(
    (searchVal: string, filtersVal: Filters, sortVal: string) => {
      const params = new URLSearchParams();
      if (searchVal) params.set("search", searchVal);
      if (filtersVal.industry) params.set("industry", filtersVal.industry);
      if (filtersVal.location) params.set("location", filtersVal.location);
      if (filtersVal.size) params.set("size", filtersVal.size);
      if (filtersVal.hasRoles) params.set("hasRoles", "true");
      if (filtersVal.verified) params.set("verified", "true");
      if (sortVal && sortVal !== "mostFollowed")
        params.set("sort", sortVal);
      return params.toString();
    },
    []
  );

  // Fetch companies from API
  const fetchCompanies = useCallback(
    async (searchVal: string, filtersVal: Filters, sortVal: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchVal) params.set("search", searchVal);
        if (filtersVal.industry) params.set("industry", filtersVal.industry);
        if (filtersVal.location) params.set("location", filtersVal.location);
        if (filtersVal.size) params.set("size", filtersVal.size);
        if (filtersVal.hasRoles) params.set("hasRoles", "true");
        if (filtersVal.verified) params.set("verified", "true");
        params.set("sort", sortVal);

        const response = await fetch(`/api/companies?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch");

        const data: CompanyApiResponse = await response.json();
        setCompanies(data.companies);
        setTotal(data.total);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update URL and fetch when filters/sort change (not search - that uses debounce)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const qs = buildQueryString(search, filters, sort);
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    fetchCompanies(search, filters, sort);
  }, [filters, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        const qs = buildQueryString(value, filters, sort);
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
        fetchCompanies(value, filters, sort);
      }, 300);
    },
    [filters, sort, buildQueryString, router, pathname, fetchCompanies]
  );

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Discover Companies" subtitle="Find top tech employers in Greece" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <SearchBar value={search} onChange={handleSearchChange} />
        </div>
        <SortDropdown value={sort} onChange={setSort} />
      </div>

      <FilterBar filters={filters} onFilterChange={setFilters} industries={industries} />

      <CompanyGrid companies={companies} total={total} loading={loading} />
    </div>
  );
}
