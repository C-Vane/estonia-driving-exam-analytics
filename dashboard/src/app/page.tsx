import { Suspense } from "react";

import { DashboardFilters } from "@/components/DashboardFilters";
import {
  AttemptPassRateChart,
  CategorySuccessChart,
  FailureReasonsChart,
  MonthlyTrendChart,
  OfficeSuccessChart,
  OutcomeBreakdownChart,
} from "@/components/Charts";
import { PaginatedRankedSuccessTable } from "@/components/PaginatedRankedTable";
import { PaginatedSimpleTable } from "@/components/PaginatedSimpleTable";
import { Panel, PanelHeading } from "@/components/Panel";
import { StatCard } from "@/components/StatCard";
import {
  getAvailableCategories,
  getAvailableOffices,
  getAvailableYears,
  getMonthlyTrend,
  getOutcomeBreakdown,
  getOverviewStats,
  getPaginatedDrivingSchoolStats,
  getPaginatedExaminerStats,
  getPaginatedOutlierSchools,
  getPaginatedTopFailures,
  getPassRateByAttemptNumber,
  getSuccessByCategory,
  getSuccessByOffice,
  getTopFailureReasons,
} from "@/lib/analytics";
import {
  buildApiFilterQueryString,
  buildDashboardQueryString,
  parseDashboardFilters,
  parsePageParam,
  TABLE_PAGE_SIZE,
} from "@/lib/dashboard-filters";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{
    years?: string;
    category?: string;
    office?: string;
    examinersPage?: string;
    schoolsPage?: string;
    outliersPage?: string;
    failuresPage?: string;
  }>;
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: {
    years?: string;
    category?: string;
    office?: string;
    examinersPage?: string;
    schoolsPage?: string;
    outliersPage?: string;
    failuresPage?: string;
  };
}) {
  const availableYears = await getAvailableYears();
  const filters = parseDashboardFilters(searchParams, availableYears);
  const queryString = buildDashboardQueryString(filters);
  const apiFilterQuery = buildApiFilterQueryString(filters);

  const examinersPage = parsePageParam(searchParams.examinersPage);
  const schoolsPage = parsePageParam(searchParams.schoolsPage);
  const outliersPage = parsePageParam(searchParams.outliersPage);
  const failuresPage = parsePageParam(searchParams.failuresPage);

  const [
    overview,
    outcomeBreakdown,
    successByCategory,
    failureReasons,
    passRateByAttempt,
    offices,
    monthlyTrend,
    examinersPageData,
    drivingSchoolsPageData,
    outlierSchoolsPageData,
    topFailuresPageData,
    availableCategories,
    availableOffices,
  ] = await Promise.all([
    getOverviewStats(filters),
    getOutcomeBreakdown(filters),
    getSuccessByCategory(filters),
    getTopFailureReasons(filters, 100),
    getPassRateByAttemptNumber(filters),
    getSuccessByOffice(filters),
    getMonthlyTrend(filters),
    getPaginatedExaminerStats(filters, examinersPage),
    getPaginatedDrivingSchoolStats(filters, schoolsPage),
    getPaginatedOutlierSchools(filters, outliersPage),
    getPaginatedTopFailures(filters, failuresPage),
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
          school outcomes, and repeat failure patterns using open data exports
          from 2021 through 2026. Click an office or examiner row for details.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="surface-card-lg h-[7.5rem] animate-pulse" />
        }
      >
        <DashboardFilters
          availableYears={availableYears}
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
          <PanelHeading
            title="Success rate by office"
            description="All offices in the filtered data. Click a bar for monthly pass rates."
          />
          <OfficeSuccessChart data={offices} apiFilterQuery={apiFilterQuery} />
        </Panel>

        <Panel>
          <PanelHeading title="Monthly trend" />
          <MonthlyTrendChart data={monthlyTrend} />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <PaginatedRankedSuccessTable
            title="All examiners"
            description={`${examinersPageData.totalItems} examiners with at least one scored attempt. Click a row for activity and outcomes.`}
            labelHeader="Examiner"
            rows={examinersPageData.rows}
            page={examinersPageData.page}
            totalPages={examinersPageData.totalPages}
            totalItems={examinersPageData.totalItems}
            pageSize={TABLE_PAGE_SIZE}
            pageParam="examinersPage"
            queryString={queryString}
            apiFilterQuery={apiFilterQuery}
            clickable="examiner"
          />
        </Panel>

        <Panel>
          <PaginatedRankedSuccessTable
            title="All driving schools"
            description={`${drivingSchoolsPageData.totalItems} schools with at least one scored attempt.`}
            labelHeader="Driving school"
            rows={drivingSchoolsPageData.rows}
            page={drivingSchoolsPageData.page}
            totalPages={drivingSchoolsPageData.totalPages}
            totalItems={drivingSchoolsPageData.totalItems}
            pageSize={TABLE_PAGE_SIZE}
            pageParam="schoolsPage"
            queryString={queryString}
            apiFilterQuery={apiFilterQuery}
          />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <PaginatedSimpleTable
            title="Schools with repeat failure candidates"
            description={`${outlierSchoolsPageData.totalItems} schools where at least one candidate failed 4 or more times.`}
            columns={[
              { key: "drivingSchool", label: "Driving school" },
              {
                key: "repeatFailureCandidates",
                label: "Candidates with 4+ failures",
              },
            ]}
            rows={outlierSchoolsPageData.rows.map((row) => ({
              drivingSchool: row.drivingSchool,
              repeatFailureCandidates:
                row.repeatFailureCandidates.toLocaleString(),
            }))}
            page={outlierSchoolsPageData.page}
            totalPages={outlierSchoolsPageData.totalPages}
            totalItems={outlierSchoolsPageData.totalItems}
            pageSize={TABLE_PAGE_SIZE}
            pageParam="outliersPage"
            queryString={queryString}
          />
        </Panel>

        <Panel>
          <PaginatedSimpleTable
            title="All repeat failure records"
            description={`${topFailuresPageData.totalItems} candidate and category pairs with at least one failure.`}
            columns={[
              { key: "candidateId", label: "Candidate" },
              { key: "kategooria", label: "Category" },
              { key: "failureCount", label: "Failed attempts" },
            ]}
            rows={topFailuresPageData.rows.map((row) => ({
              candidateId: row.candidateId,
              kategooria: row.kategooria,
              failureCount: row.failureCount.toLocaleString(),
            }))}
            page={topFailuresPageData.page}
            totalPages={topFailuresPageData.totalPages}
            totalItems={topFailuresPageData.totalItems}
            pageSize={TABLE_PAGE_SIZE}
            pageParam="failuresPage"
            queryString={queryString}
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
