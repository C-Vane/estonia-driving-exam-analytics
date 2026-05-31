"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EntityDetailModal } from "@/components/EntityDetailModal";

import { ChartContainer } from "@/components/ChartContainer";
import { MonthlyTrendTooltip } from "@/components/ChartTooltip";
import type {
  AttemptPassRatePoint,
  FailureReasonPoint,
  GroupSuccessStats,
  MonthlyTrendPoint,
  OutcomeBreakdownPoint,
} from "@/lib/database.types";
import {
  chartAxisTick,
  chartLegendStyle,
  chartTheme,
  outcomeSliceColors,
  shadeAt,
} from "@/lib/chart-theme";

const tooltipStyle = chartTheme.tooltip;

const legendProps = {
  wrapperStyle: chartLegendStyle,
};

interface OfficeSuccessChartProps {
  data: GroupSuccessStats[];
  apiFilterQuery: string;
}

export function OfficeSuccessChart({
  data,
  apiFilterQuery,
}: OfficeSuccessChartProps) {
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);

  const chartData = data.map((item) => ({
    office: item.label,
    successRate: Number(item.successRate.toFixed(1)),
    totalAttempts: item.totalAttempts,
  }));

  const chartHeight = Math.max(384, chartData.length * 36);

  return (
    <>
      <p className="mb-3 text-sm text-zinc-500">
        Click an office bar to see monthly pass rates (weekday breakdown is not
        available in this dataset).
      </p>
      <ChartContainer className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
          >
          <CartesianGrid
            stroke={chartTheme.grid}
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={chartAxisTick}
            stroke={chartTheme.axis}
          />
          <YAxis
            type="category"
            dataKey="office"
            width={140}
            tick={chartAxisTick}
            stroke={chartTheme.axis}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={{ color: chartTheme.tick }}
            labelStyle={{ color: "#fafafa" }}
            formatter={(value, name) =>
              name === "successRate"
                ? [`${value}%`, "Success rate"]
                : [value, name]
            }
          />
          <Legend {...legendProps} />
          <Bar
            dataKey="successRate"
            name="Success rate"
            radius={[0, 6, 6, 0]}
            className="cursor-pointer"
            onClick={(data) => {
              const payload = data?.payload as { office?: string } | undefined;

              if (payload?.office) {
                setSelectedOffice(payload.office);
              }
            }}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={shadeAt(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>

      {selectedOffice && (
        <EntityDetailModal
          type="office"
          name={selectedOffice}
          filterQuery={apiFilterQuery}
          onClose={() => setSelectedOffice(null)}
        />
      )}
    </>
  );
}

interface OutcomeBreakdownChartProps {
  data: OutcomeBreakdownPoint[];
}

export function OutcomeBreakdownChart({ data }: OutcomeBreakdownChartProps) {
  const chartData = data.map((item) => ({
    name: item.outcome,
    value: item.count,
    percentage: Number(item.percentage.toFixed(1)),
  }));

  return (
    <ChartContainer className="w-full" style={{ height: 440 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={95}
            outerRadius={160}
            paddingAngle={2}
            label={({ name, percent, x, y }) => (
              <text
                x={x}
                y={y}
                fill="#a1a1aa"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
              >
                {`${name} (${((percent ?? 0) * 100).toFixed(1)}%)`}
              </text>
            )}
            labelLine={{ stroke: "#52525b" }}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={outcomeSliceColors[entry.name] ?? shadeAt(0)}
                stroke="#121212"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={{ color: chartTheme.tick }}
            labelStyle={{ color: "#fafafa" }}
            formatter={(value, name, item) => {
              const percentage =
                (item.payload as { percentage?: number }).percentage ?? 0;

              return [
                `${Number(value).toLocaleString()} (${percentage}%)`,
                name,
              ];
            }}
          />
          <Legend {...legendProps} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface CategorySuccessChartProps {
  data: GroupSuccessStats[];
}

export function CategorySuccessChart({ data }: CategorySuccessChartProps) {
  const chartData = data.map((item) => ({
    category: item.label,
    successRate: Number(item.successRate.toFixed(1)),
    totalAttempts: item.totalAttempts,
  }));

  const chartHeight = Math.max(320, chartData.length * 40);

  return (
    <ChartContainer className="w-full" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
        >
          <CartesianGrid
            stroke={chartTheme.grid}
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={chartAxisTick}
            stroke={chartTheme.axis}
          />
          <YAxis
            type="category"
            dataKey="category"
            width={48}
            tick={chartAxisTick}
            stroke={chartTheme.axis}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={{ color: chartTheme.tick }}
            labelStyle={{ color: "#fafafa" }}
            formatter={(value, name) =>
              name === "successRate"
                ? [`${value}%`, "Success rate"]
                : [Number(value).toLocaleString(), "Attempts"]
            }
          />
          <Legend {...legendProps} />
          <Bar dataKey="successRate" name="Success rate" radius={[0, 6, 6, 0]}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={shadeAt(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface FailureReasonsChartProps {
  data: FailureReasonPoint[];
}

export function FailureReasonsChart({ data }: FailureReasonsChartProps) {
  const chartData = data.map((item) => ({
    label: item.label,
    count: item.count,
  }));

  const chartHeight = Math.max(320, chartData.length * 36);

  return (
    <ChartContainer className="w-full" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
        >
          <CartesianGrid
            stroke={chartTheme.grid}
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={chartAxisTick}
            stroke={chartTheme.axis}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={160}
            tick={{ fontSize: 11, fill: chartTheme.tick }}
            stroke={chartTheme.axis}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={{ color: chartTheme.tick }}
            labelStyle={{ color: "#fafafa" }}
            formatter={(value) => [Number(value).toLocaleString(), "Failures"]}
          />
          <Bar dataKey="count" name="Failures" radius={[0, 6, 6, 0]}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={shadeAt(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface AttemptPassRateChartProps {
  data: AttemptPassRatePoint[];
}

export function AttemptPassRateChart({ data }: AttemptPassRateChartProps) {
  const chartData = data.map((item) => ({
    attempt: item.attemptLabel,
    successRate: Number(item.successRate.toFixed(1)),
    totalAttempts: item.totalAttempts,
  }));

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
          <XAxis dataKey="attempt" tick={chartAxisTick} stroke={chartTheme.axis} />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={chartAxisTick}
            stroke={chartTheme.axis}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={{ color: chartTheme.tick }}
            labelStyle={{ color: "#fafafa" }}
            formatter={(value, name) => {
              if (name === "successRate") {
                return [`${value}%`, "Success rate"];
              }

              return [Number(value).toLocaleString(), "Attempts"];
            }}
          />
          <Legend {...legendProps} />
          <Bar dataKey="successRate" name="Success rate" radius={[6, 6, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={shadeAt(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface MonthlyTrendChartProps {
  data: MonthlyTrendPoint[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const chartData = data.map((item) => ({
    month: item.month,
    successRate: Number(item.successRate.toFixed(1)),
    totalAttempts: item.totalAttempts,
  }));

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={chartAxisTick} stroke={chartTheme.axis} />
          <YAxis
            yAxisId="left"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={chartAxisTick}
            stroke={chartTheme.axis}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={chartAxisTick}
            stroke={chartTheme.axis}
          />
          <Tooltip content={MonthlyTrendTooltip} />
          <Legend {...legendProps} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="successRate"
            name="Success rate (%)"
            stroke={chartTheme.linePrimary}
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="totalAttempts"
            name="Scored exam attempts"
            stroke={chartTheme.lineSecondary}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface RankedTableProps {
  title: string;
  rows: GroupSuccessStats[];
  labelHeader: string;
}

export function RankedSuccessTable({
  title,
  rows,
  labelHeader,
}: RankedTableProps) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      <div className="overflow-x-auto rounded-xl border border-zinc-800/80">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-black/50 text-xs uppercase tracking-wide text-zinc-300">
            <tr>
              <th className="px-4 py-3 font-semibold">{labelHeader}</th>
              <th className="px-4 py-3 font-semibold">Passed</th>
              <th className="px-4 py-3 font-semibold">Failed</th>
              <th className="px-4 py-3 font-semibold">Attempts</th>
              <th className="px-4 py-3 font-semibold">Success rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.label} className="hover:bg-zinc-900/40">
                <td className="px-4 py-3 font-medium text-white">
                  {row.label}
                </td>
                <td className="px-4 py-3">{row.passedCount.toLocaleString()}</td>
                <td className="px-4 py-3">{row.failedCount.toLocaleString()}</td>
                <td className="px-4 py-3">{row.totalAttempts.toLocaleString()}</td>
                <td className="px-4 py-3 font-medium text-white">
                  {row.successRate.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface SimpleTableProps<T> {
  title: string;
  columns: Array<{ key: keyof T; label: string }>;
  rows: T[];
}

export function SimpleTable<T extends Record<string, string | number>>({
  title,
  columns,
  rows,
}: SimpleTableProps<T>) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      <div className="overflow-x-auto rounded-xl border border-zinc-800/80">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-black/50 text-xs uppercase tracking-wide text-zinc-300">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-zinc-900/40">
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-4 py-3">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
