"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { FilterSelect } from "@/components/FilterSelect";

interface DashboardFiltersProps {
  categories: string[];
  offices: string[];
  selectedYears: number[];
  selectedCategory: string;
  selectedOffice: string;
}

export function DashboardFilters({
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

  function toggleYear(year: number) {
    const params = new URLSearchParams(searchParams.toString());
    const currentYears = params.get("years")?.split(",").map(Number) ?? [
      2025, 2026,
    ];
    const nextYears = currentYears.includes(year)
      ? currentYears.filter((currentYear) => currentYear !== year)
      : [...currentYears, year].sort();

    if (nextYears.length === 0) {
      return;
    }

    params.set("years", nextYears.join(","));
    navigate(params);
  }

  return (
    <div
      className={`grid gap-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 md:grid-cols-3 ${isPending ? "opacity-70" : ""}`}
    >
      <div>
        <p className="mb-2 block text-sm font-medium text-neutral-300">Years</p>
        <div className="flex flex-wrap gap-2">
          {[2025, 2026].map((year) => {
            const isSelected = selectedYears.includes(year);

            return (
              <button
                key={year}
                type="button"
                onClick={() => toggleYear(year)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  isSelected
                    ? "border-white bg-white text-black"
                    : "border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-500 hover:text-white"
                }`}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>

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
  );
}
