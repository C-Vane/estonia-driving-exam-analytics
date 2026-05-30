"use client";

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

import { ChartContainer } from "@/components/ChartContainer";
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
} from "@/lib/chart-theme";

const tooltipStyle = chartTheme.tooltip;

const legendProps = {
  wrapperStyle: chartLegendStyle,
};

const OUTCOME_COLORS: Record<string, string> = {
  Passed: "#34d399",
  Failed: "#f87171",
  "No-show": "#fbbf24",
  Interrupted: "#737373",
};

interface OfficeSuccessChartProps {
  data: GroupSuccessStats[];
}

export function OfficeSuccessChart({ data }: OfficeSuccessChartProps) {
  const chartData = data.map((item) => ({
    office: item.label,
    successRate: Number(item.successRate.toFixed(1)),
    totalAttempts: item.totalAttempts,
  }));

  const chartHeight = Math.max(384, chartData.length * 36);

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
            fill="#60a5fa"
            radius={[0, 6, 6, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
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
    <ChartContainer className="w-full" style={{ height: 420 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={90}
            outerRadius={150}
            paddingAngle={2}
            label={({ name, percent, x, y }) => (
              <text
                x={x}
                y={y}
                fill="#d4d4d4"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
              >
                {`${name} (${((percent ?? 0) * 100).toFixed(1)}%)`}
              </text>
            )}
            labelLine={{ stroke: chartTheme.axis }}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={OUTCOME_COLORS[entry.name] ?? "#94a3b8"}
                stroke="#0a0a0a"
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
          <Bar
            dataKey="successRate"
            name="Success rate"
            fill="#a78bfa"
            radius={[0, 6, 6, 0]}
          />
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
          <Bar dataKey="count" name="Failures" fill="#f87171" radius={[0, 6, 6, 0]} />
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
          <Bar
            dataKey="successRate"
            name="Success rate"
            fill="#38bdf8"
            radius={[6, 6, 0, 0]}
          />
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
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={{ color: chartTheme.tick }}
            labelStyle={{ color: "#fafafa" }}
            formatter={(value, name) => {
              if (name === "successRate") {
                return [`${value}%`, "Success rate"];
              }

              return [value, "Attempts"];
            }}
          />
          <Legend {...legendProps} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="successRate"
            name="Success rate"
            stroke="#34d399"
            strokeWidth={3}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="totalAttempts"
            name="Attempts"
            stroke="#c084fc"
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
      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="w-full text-left text-sm text-neutral-400">
          <thead className="bg-neutral-900 text-xs uppercase tracking-wide text-neutral-300">
            <tr>
              <th className="px-4 py-3 font-semibold">{labelHeader}</th>
              <th className="px-4 py-3 font-semibold">Passed</th>
              <th className="px-4 py-3 font-semibold">Failed</th>
              <th className="px-4 py-3 font-semibold">Attempts</th>
              <th className="px-4 py-3 font-semibold">Success rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 bg-neutral-950">
            {rows.slice(0, 15).map((row) => (
              <tr key={row.label} className="hover:bg-neutral-900">
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
      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="w-full text-left text-sm text-neutral-400">
          <thead className="bg-neutral-900 text-xs uppercase tracking-wide text-neutral-300">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 bg-neutral-950">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-neutral-900">
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
