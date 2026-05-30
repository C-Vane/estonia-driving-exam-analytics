/** Blue-cyan shades (light → deep), shared across every chart. */
export const blueShades = [
  "#7dd3fc",
  "#38bdf8",
  "#0ea5e9",
  "#0284c7",
  "#0369a1",
  "#075985",
] as const;

export function shadeAt(index: number): string {
  return blueShades[index % blueShades.length];
}

export const dataColors = {
  light: blueShades[0],
  primary: blueShades[1],
  medium: blueShades[2],
  strong: blueShades[3],
  deep: blueShades[4],
  darkest: blueShades[5],
} as const;

export const chartTheme = {
  grid: "#1c2433",
  axis: "#3f4f63",
  tick: "#94a3b8",
  tooltip: {
    backgroundColor: "#121212",
    border: "1px solid #1e3a5f",
    borderRadius: "0.75rem",
    color: "#fafafa",
  },
  legend: "#94a3b8",
  bar: dataColors.primary,
  linePrimary: dataColors.light,
  lineSecondary: dataColors.strong,
};

export const chartAxisTick = { fontSize: 12, fill: chartTheme.tick };
export const chartLegendStyle = { color: chartTheme.legend };

/** Donut: brightest blue for passed, progressively deeper shades. */
export const outcomeSliceColors: Record<string, string> = {
  Passed: dataColors.light,
  Failed: dataColors.primary,
  "No-show": dataColors.medium,
  Interrupted: dataColors.deep,
};
