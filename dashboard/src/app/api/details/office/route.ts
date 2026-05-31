import { NextResponse } from "next/server";

import { getOfficeDetail, getAvailableYears } from "@/lib/analytics";
import { parseDashboardFilters } from "@/lib/dashboard-filters";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const office = searchParams.get("office");

  if (!office) {
    return NextResponse.json({ error: "Office name is required." }, { status: 400 });
  }

  const availableYears = await getAvailableYears();
  const filters = parseDashboardFilters(
    {
      years: searchParams.get("years") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      office: searchParams.get("filterOffice") ?? undefined,
    },
    availableYears,
  );

  const detail = await getOfficeDetail(office, filters);

  if (!detail) {
    return NextResponse.json({ error: "Office not found." }, { status: 404 });
  }

  return NextResponse.json(detail);
}
