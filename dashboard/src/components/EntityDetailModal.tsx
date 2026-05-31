"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "flowbite-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer } from "@/components/ChartContainer";
import { MonthlyTrendTooltip } from "@/components/ChartTooltip";
import type { ExaminerDetail, OfficeDetail } from "@/lib/database.types";
import { chartAxisTick, chartTheme, shadeAt } from "@/lib/chart-theme";

const tooltipStyle = chartTheme.tooltip;

interface EntityDetailModalProps {
  type: "office" | "examiner";
  name: string;
  filterQuery: string;
  onClose: () => void;
}

export function EntityDetailModal({
  type,
  name,
  filterQuery,
  onClose,
}: EntityDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [officeDetail, setOfficeDetail] = useState<OfficeDetail | null>(null);
  const [examinerDetail, setExaminerDetail] = useState<ExaminerDetail | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadDetail() {
      setLoading(true);
      setError(null);

      const parameters = new URLSearchParams(filterQuery);
      const endpoint =
        type === "office"
          ? `/api/details/office?office=${encodeURIComponent(name)}&${parameters.toString()}`
          : `/api/details/examiner?examiner=${encodeURIComponent(name)}&${parameters.toString()}`;

      try {
        const response = await fetch(endpoint, { signal: controller.signal });

        if (!response.ok) {
          throw new Error("Could not load details.");
        }

        const payload = await response.json();

        if (type === "office") {
          setOfficeDetail(payload as OfficeDetail);
        } else {
          setExaminerDetail(payload as ExaminerDetail);
        }
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Could not load details.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDetail();

    return () => controller.abort();
  }, [type, name, filterQuery]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      onClick={onClose}
    >
      <div
        className="surface-card-lg max-h-[90vh] w-full max-w-3xl overflow-y-auto shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-zinc-800 bg-[#121212] px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {type === "office" ? "Office detail" : "Examiner detail"}
            </p>
            <h2
              id="detail-modal-title"
              className="mt-1 text-xl font-semibold text-white"
            >
              {name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-700 p-2 text-zinc-400 transition hover:text-white"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <DataLimitationNotice type={type} />

          {loading && (
            <p className="text-sm text-zinc-400">Loading details…</p>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          {!loading && !error && type === "office" && officeDetail && (
            <OfficeDetailContent detail={officeDetail} />
          )}

          {!loading && !error && type === "examiner" && examinerDetail && (
            <ExaminerDetailContent detail={examinerDetail} />
          )}
        </div>
      </div>
    </div>
  );
}

function DataLimitationNotice({ type }: { type: "office" | "examiner" }) {
  return (
    <p className="rounded-lg border border-cyan-900/40 bg-cyan-950/20 px-4 py-3 text-sm leading-relaxed text-zinc-400">
      {type === "office" ? (
        <>
          Exam dates in this open dataset are recorded as <strong className="text-zinc-300">year-month only</strong> (for example 2024-03), not by calendar day or weekday. Pass rates by day of the week are not available; the chart below shows the closest view — pass rate by month for this office.
        </>
      ) : (
        <>
          This dataset does not include clock times or weekdays for when exams were held. Below you can see <strong className="text-zinc-300">which months</strong> the examiner was active, exam volume per month, offices and categories, pass versus fail counts, and average exam duration in minutes where recorded.
        </>
      )}
    </p>
  );
}

function OfficeDetailContent({ detail }: { detail: OfficeDetail }) {
  const monthlyChartData = detail.monthlyTrend.map((point) => ({
    month: point.month,
    successRate: Number(point.successRate.toFixed(1)),
    totalAttempts: point.totalAttempts,
  }));

  return (
    <>
      <SummaryGrid
        items={[
          { label: "Passed", value: detail.overview.passedCount },
          { label: "Failed", value: detail.overview.failedCount },
          { label: "Scored attempts", value: detail.overview.totalAttempts },
          {
            label: "Success rate",
            value: `${detail.overview.successRate.toFixed(1)}%`,
          },
        ]}
      />

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Pass rate by month
        </h3>
        <ChartContainer style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyChartData}>
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={chartAxisTick} stroke={chartTheme.axis} />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={chartAxisTick}
                stroke={chartTheme.axis}
              />
              <Tooltip content={MonthlyTrendTooltip} />
              <Line
                type="monotone"
                dataKey="successRate"
                name="Success rate (%)"
                stroke={chartTheme.linePrimary}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </section>

      {detail.byCategory.length > 0 && (
        <BreakdownTable
          title="By category (all years in filter)"
          rows={detail.byCategory}
        />
      )}
    </>
  );
}

function ExaminerDetailContent({ detail }: { detail: ExaminerDetail }) {
  const monthlyChartData = detail.monthlyActivity.map((point) => ({
    month: point.month,
    exams: point.totalAttempts,
    successRate: Number(point.successRate.toFixed(1)),
  }));

  return (
    <>
      <SummaryGrid
        items={[
          { label: "Total exams", value: detail.totalExams },
          { label: "Passed", value: detail.passedCount },
          { label: "Failed", value: detail.failedCount },
          { label: "No-shows", value: detail.noShowCount },
          { label: "Interrupted", value: detail.interruptedCount },
          {
            label: "Success rate",
            value: `${detail.successRate.toFixed(1)}%`,
          },
        ]}
      />

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Active months
        </h3>
        <p className="text-sm text-zinc-400">
          {detail.activeMonths.join(", ") || "No months recorded."}
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Exams per month
        </h3>
        <ChartContainer style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChartData}>
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={chartAxisTick} stroke={chartTheme.axis} />
              <YAxis tick={chartAxisTick} stroke={chartTheme.axis} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="exams" name="Exams" radius={[6, 6, 0, 0]}>
                {monthlyChartData.map((_, index) => (
                  <Cell key={index} fill={shadeAt(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </section>

      {(detail.averageDurationMinutes.passed !== null ||
        detail.averageDurationMinutes.failed !== null) && (
        <p className="text-sm text-zinc-400">
          Average exam duration (minutes, where recorded): passed{" "}
          {detail.averageDurationMinutes.passed?.toFixed(1) ?? "—"}, failed{" "}
          {detail.averageDurationMinutes.failed?.toFixed(1) ?? "—"} (
          {detail.averageDurationMinutes.recordedExams.toLocaleString()} exams
          with duration).
        </p>
      )}

      {detail.byOffice.length > 0 && (
        <BreakdownTable title="By office" rows={detail.byOffice} />
      )}

      {detail.byCategory.length > 0 && (
        <BreakdownTable title="By category" rows={detail.byCategory} />
      )}
    </>
  );
}

function SummaryGrid({
  items,
}: {
  items: Array<{ label: string; value: number | string }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-zinc-800 bg-black/40 px-4 py-3"
        >
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {item.label}
          </p>
          <p className="mt-1 text-lg font-semibold text-white">
            {typeof item.value === "number"
              ? item.value.toLocaleString()
              : item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function BreakdownTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<{
    label: string;
    passedCount: number;
    failedCount: number;
    totalAttempts: number;
    successRate: number;
  }>;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h3>
      <div className="overflow-x-auto rounded-xl border border-zinc-800/80">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-black/50 text-xs uppercase tracking-wide text-zinc-300">
            <tr>
              <th className="px-4 py-3 font-semibold">Label</th>
              <th className="px-4 py-3 font-semibold">Passed</th>
              <th className="px-4 py-3 font-semibold">Failed</th>
              <th className="px-4 py-3 font-semibold">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="px-4 py-3 font-medium text-white">{row.label}</td>
                <td className="px-4 py-3">{row.passedCount.toLocaleString()}</td>
                <td className="px-4 py-3">{row.failedCount.toLocaleString()}</td>
                <td className="px-4 py-3">{row.successRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
