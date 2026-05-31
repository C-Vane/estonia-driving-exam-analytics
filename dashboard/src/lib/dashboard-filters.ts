import type { DashboardFilters } from "./database.types";

export const TABLE_PAGE_SIZE = 20;

export function parseYearsParam(
  yearsParam: string | undefined,
  availableYears: number[],
): number[] {
  const years = yearsParam
    ? yearsParam.split(",").map(Number).filter(Boolean)
    : availableYears;

  return years.length > 0 ? years : availableYears;
}

export function parseDashboardFilters(
  searchParams: {
    years?: string;
    category?: string;
    office?: string;
  },
  availableYears: number[],
): DashboardFilters {
  return {
    years: parseYearsParam(searchParams.years, availableYears),
    kategooria: searchParams.category ?? "B",
    byroo: searchParams.office ?? "all",
  };
}

export function parsePageParam(
  value: string | undefined,
  defaultPage = 1,
): number {
  const page = Number(value);

  if (!Number.isFinite(page) || page < 1) {
    return defaultPage;
  }

  return Math.floor(page);
}

export function buildDashboardQueryString(
  filters: DashboardFilters,
  extras?: Record<string, string | number | undefined>,
): string {
  const parameters = new URLSearchParams();
  parameters.set("years", filters.years.join(","));
  parameters.set("category", filters.kategooria);

  if (filters.byroo !== "all") {
    parameters.set("office", filters.byroo);
  }

  if (extras) {
    for (const [key, value] of Object.entries(extras)) {
      if (value !== undefined && value !== "") {
        parameters.set(key, String(value));
      }
    }
  }

  return parameters.toString();
}

/** Query string for detail API routes (`filterOffice`, not `office`). */
export function buildApiFilterQueryString(filters: DashboardFilters): string {
  const parameters = new URLSearchParams();
  parameters.set("years", filters.years.join(","));
  parameters.set("category", filters.kategooria);

  if (filters.byroo !== "all") {
    parameters.set("filterOffice", filters.byroo);
  }

  return parameters.toString();
}

export function officeMatchesFilter(
  officeName: string,
  filters: DashboardFilters,
): boolean {
  if (filters.byroo === "all") {
    return true;
  }

  if (filters.byroo === "Tallinn") {
    return officeName.startsWith("Tallinn");
  }

  return officeName === filters.byroo;
}

export function officeWhereCondition(
  officeName: string,
): Pick<DashboardFilters, "byroo"> {
  return { byroo: officeName };
}
