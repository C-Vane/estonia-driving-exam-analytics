import { NextResponse } from "next/server";

import { getExaminerDetail, getAvailableYears } from "@/lib/analytics";
import { parseDashboardFilters } from "@/lib/dashboard-filters";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const examiner = searchParams.get("examiner");

  if (!examiner) {
    return NextResponse.json(
      { error: "Examiner name is required." },
      { status: 400 },
    );
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

  const detail = await getExaminerDetail(examiner, filters);

  if (!detail) {
    return NextResponse.json({ error: "Examiner not found." }, { status: 404 });
  }

  return NextResponse.json(detail);
}
