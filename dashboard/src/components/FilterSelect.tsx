"use client";

import type { ReactNode } from "react";
import { ChevronDownIcon } from "flowbite-react";

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

export function FilterSelect({
  id,
  label,
  value,
  onChange,
  children,
}: FilterSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-neutral-300">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="block w-full appearance-none rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 pr-10 pl-3 text-sm text-white focus:border-neutral-500 focus:ring-2 focus:ring-neutral-600 focus:outline-none"
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      </div>
    </div>
  );
}
