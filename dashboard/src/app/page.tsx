import { Suspense } from "react";

import { DashboardFilters } from "@/components/DashboardFilters";
import {
  AttemptPassRateChart,
  CategorySuccessChart,
  FailureReasonsChart,
  MonthlyTrendChart,
  OfficeSuccessChart,
  OutcomeBreakdownChart,
  RankedSuccessTable,
  SimpleTable,
} from "@/components/Charts";
import { Panel, PanelHeading } from "@/components/Panel";
import { StatCard } from "@/components/StatCard";
import {
  getAvailableCategories,
  getAvailableOffices,
  getDrivingSchoolStats,
  getExaminerStats,
  getMonthlyTrend,
  getOutcomeBreakdown,
  getOutlierSchools,
  getOverviewStats,
  getPassRateByAttemptNumber,
  getSuccessByCategory,
  getSuccessByOffice,
  getTopFailureReasons,
  getTopFailures,
} from "@/lib/analytics";
import type { DashboardFilters as FilterState } from "@/lib/database.types";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{
    years?: string;
    category?: string;
    office?: string;
  }>;
}

function parseFilters(searchParams: {
  years?: string;
  category?: string;
  office?: string;
}): FilterState {
  const years = searchParams.years
    ? searchParams.years.split(",").map(Number).filter(Boolean)
    : [2025, 2026];

  return {
    years: years.length > 0 ? years : [2025, 2026],
    kategooria: searchParams.category ?? "B",
    byroo: searchParams.office ?? "all",
  };
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: {
    years?: string;
    category?: string;
    office?: string;
  };
}) {
  const filters = parseFilters(searchParams);

  const [
    overview,
    outcomeBreakdown,
    successByCategory,
    failureReasons,
    passRateByAttempt,
    offices,
    monthlyTrend,
    examiners,
    drivingSchools,
    outlierSchools,
    topFailures,
    availableCategories,
    availableOffices,
  ] = await Promise.all([
    getOverviewStats(filters),
    getOutcomeBreakdown(filters),
    getSuccessByCategory(filters),
    getTopFailureReasons(filters),
    getPassRateByAttemptNumber(filters),
    getSuccessByOffice(filters),
    getMonthlyTrend(filters),
    getExaminerStats(filters),
    getDrivingSchoolStats(filters),
    getOutlierSchools(filters),
    getTopFailures(filters),
    getAvailableCategories(filters.years),
    getAvailableOffices({
      years: filters.years,
      kategooria: filters.kategooria,
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
          Estonia driving exams
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Driving exam analytics dashboard
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-zinc-400">
          Explore pass rates, office performance, examiner statistics, driving
          school outcomes, and repeat failure patterns using the 2025 and 2026
          open data exports.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="surface-card-lg h-[7.5rem] animate-pulse" />
        }
      >
        <DashboardFilters
          categories={availableCategories}
          offices={availableOffices}
          selectedYears={filters.years}
          selectedCategory={filters.kategooria}
          selectedOffice={filters.byroo}
        />
      </Suspense>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total exams"
          value={overview.totalExams.toLocaleString()}
          description="All recorded exam attempts in the selected period."
        />
        <StatCard
          title="Success rate"
          value={`${overview.successRate.toFixed(1)}%`}
          description="Passed divided by passed plus failed attempts."
        />
        <StatCard
          title="Failed attempts"
          value={overview.failedCount.toLocaleString()}
          description="Exams marked as not passed."
        />
        <StatCard
          title="No-shows"
          value={overview.noShowCount.toLocaleString()}
          description="Candidates who did not appear for the exam."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeading
            title="Exam outcomes"
            description="Share of all recorded attempts by final status."
          />
          <OutcomeBreakdownChart data={outcomeBreakdown} />
        </Panel>

        <Panel>
          <PanelHeading
            title="Success rate by category"
            description="Pass rates across license categories for the selected years and office filter."
          />
          <CategorySuccessChart data={successByCategory} />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeading
            title="Top failure reasons"
            description="Most common error codes on failed exams in the selected category."
          />
          <FailureReasonsChart data={failureReasons} />
        </Panel>

        <Panel>
          <PanelHeading
            title="Pass rate by attempt number"
            description="Success rate on the 1st, 2nd, 3rd scored attempt per candidate and category."
          />
          <AttemptPassRateChart data={passRateByAttempt} />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeading title="Success rate by office" />
          <OfficeSuccessChart data={offices} />
        </Panel>

        <Panel>
          <PanelHeading title="Monthly trend" />
          <MonthlyTrendChart data={monthlyTrend} />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <RankedSuccessTable
            title="Top examiners by success rate"
            labelHeader="Examiner"
            rows={examiners}
          />
        </Panel>

        <Panel>
          <RankedSuccessTable
            title="Driving schools by volume"
            labelHeader="Driving school"
            rows={drivingSchools}
          />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <SimpleTable
            title="Schools with repeat failure candidates"
            columns={[
              { key: "drivingSchool", label: "Driving school" },
              {
                key: "repeatFailureCandidates",
                label: "Candidates with 4+ failures",
              },
            ]}
            rows={outlierSchools.slice(0, 15).map((row) => ({
              drivingSchool: row.drivingSchool,
              repeatFailureCandidates:
                row.repeatFailureCandidates.toLocaleString(),
            }))}
          />
        </Panel>

        <Panel>
          <SimpleTable
            title="Top repeat failures"
            columns={[
              { key: "candidateId", label: "Candidate" },
              { key: "kategooria", label: "Category" },
              { key: "failureCount", label: "Failed attempts" },
            ]}
            rows={topFailures.map((row) => ({
              candidateId: row.candidateId,
              kategooria: row.kategooria,
              failureCount: row.failureCount.toLocaleString(),
            }))}
          />
        </Panel>
      </section>
    </div>
  );
}

export default async function Home({
  searchParams,
}: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="dashboard-page">
      <DashboardContent searchParams={resolvedSearchParams} />
    </main>
  );
}
