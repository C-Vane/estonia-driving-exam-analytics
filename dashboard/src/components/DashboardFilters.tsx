"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { FilterSelect } from "@/components/FilterSelect";
import { YearFilter } from "@/components/YearFilter";

interface DashboardFiltersProps {
  availableYears: number[];
  categories: string[];
  offices: string[];
  selectedYears: number[];
  selectedCategory: string;
  selectedOffice: string;
}

export function DashboardFilters({
  availableYears,
  categories,
  offices,
  selectedYears,
  selectedCategory,
  selectedOffice,
}: DashboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function navigate(nextParams: URLSearchParams) {
    startTransition(() => {
      router.push(`/?${nextParams.toString()}`);
      router.refresh();
    });
  }

  function updateSearchParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    navigate(params);
  }

  return (
    <div
      className={`surface-card-lg flex flex-col gap-8 shadow-2xl shadow-black/40 ${isPending ? "opacity-70" : ""}`}
    >
      <YearFilter availableYears={availableYears} selectedYears={selectedYears} />

      <div className="grid gap-8 md:grid-cols-2">
        <FilterSelect
          id="category"
          label="Category"
          value={selectedCategory}
          onChange={(value) => updateSearchParam("category", value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          id="office"
          label="Office"
          value={selectedOffice}
          onChange={(value) => updateSearchParam("office", value)}
        >
          <option value="all">All offices</option>
          <option value="Tallinn">All Tallinn offices</option>
          {offices.map((office) => (
            <option key={office} value={office}>
              {office}
            </option>
          ))}
        </FilterSelect>
      </div>
    </div>
  );
}
