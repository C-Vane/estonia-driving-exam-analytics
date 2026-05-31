"use client";

import type { TooltipProps } from "recharts";

import { chartTheme } from "@/lib/chart-theme";

export function formatMonthLabel(month: string): string {
  const [yearPart, monthPart] = month.split("-");
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;

  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) {
    return month;
  }

  return new Date(year, monthIndex).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

interface DualMetricTooltipPayload {
  successRate?: number;
  totalAttempts?: number;
}

export function MonthlyTrendTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length || label === undefined) {
    return null;
  }

  const point = payload[0]?.payload as DualMetricTooltipPayload | undefined;
  const successRate = point?.successRate;
  const totalAttempts = point?.totalAttempts;

  return (
    <div
      className="rounded-xl border px-4 py-3 text-sm shadow-lg"
      style={{
        backgroundColor: chartTheme.tooltip.backgroundColor,
        border: chartTheme.tooltip.border,
        color: chartTheme.tooltip.color,
      }}
    >
      <p className="font-semibold text-white">{formatMonthLabel(String(label))}</p>
      <dl className="mt-2 space-y-1.5 text-zinc-400">
        <div className="flex justify-between gap-6">
          <dt>Scored exam attempts</dt>
          <dd className="font-medium text-white">
            {totalAttempts !== undefined
              ? Number(totalAttempts).toLocaleString()
              : "—"}
          </dd>
        </div>
        <p className="text-xs text-zinc-500">
          Passed plus failed exams in this month (category and office filters
          apply).
        </p>
        <div className="flex justify-between gap-6 border-t border-zinc-800 pt-2">
          <dt>Success rate</dt>
          <dd className="font-medium text-white">
            {successRate !== undefined
              ? `${Number(successRate).toFixed(1)}%`
              : "—"}
          </dd>
        </div>
        <p className="text-xs text-zinc-500">
          Share of those attempts that were marked as passed.
        </p>
      </dl>
    </div>
  );
}
