"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

interface YearFilterProps {
  availableYears: number[];
  selectedYears: number[];
}

export function YearFilter({ availableYears, selectedYears }: YearFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pickedYears, setPickedYears] = useState(selectedYears);

  useEffect(() => {
    setPickedYears(selectedYears);
  }, [selectedYears]);

  function navigate(nextParams: URLSearchParams) {
    startTransition(() => {
      router.push(`/?${nextParams.toString()}`);
      router.refresh();
    });
  }

  function commitYears(years: number[]) {
    if (years.length === 0) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    const isAllYears =
      years.length === availableYears.length &&
      availableYears.every((year) => years.includes(year));

    if (isAllYears) {
      params.delete("years");
    } else {
      params.set("years", years.join(","));
    }

    navigate(params);
  }

  function toggleYear(year: number) {
    const nextYears = pickedYears.includes(year)
      ? pickedYears.filter((currentYear) => currentYear !== year)
      : [...pickedYears, year].sort();

    setPickedYears(nextYears);
    commitYears(nextYears);
  }

  function selectAllYears() {
    const nextYears = [...availableYears];
    setPickedYears(nextYears);
    commitYears(nextYears);
  }

  function clearAllYears() {
    setPickedYears([]);
  }

  return (
    <div className={isPending ? "opacity-70" : ""}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-300">Years</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAllYears}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-zinc-200"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={clearAllYears}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-300 ring-1 ring-zinc-700 transition hover:text-white"
          >
            Deselect all
          </button>
        </div>
      </div>

      <p className="mb-3 text-sm text-zinc-500">
        {pickedYears.length === 0
          ? "Select at least one year"
          : `${pickedYears.length} of ${availableYears.length} years selected`}
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
        {availableYears.map((year) => {
          const isSelected = pickedYears.includes(year);

          return (
            <label
              key={year}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                isSelected
                  ? "border-[var(--accent)] bg-zinc-900 text-white"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleYear(year)}
                className="h-4 w-4 rounded border-zinc-600 bg-black text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-offset-0"
              />
              {year}
            </label>
          );
        })}
      </div>
    </div>
  );
}
