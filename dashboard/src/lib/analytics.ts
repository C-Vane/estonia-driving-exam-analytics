import { sql, type ExpressionBuilder } from "kysely";

import { getDatabase } from "./db";
import type {
  AttemptPassRatePoint,
  DashboardFilters,
  Database,
  FailureReasonPoint,
  GroupSuccessStats,
  MonthlyTrendPoint,
  OutcomeBreakdownPoint,
  OutlierSchoolStats,
  OverviewStats,
  TopFailureStats,
} from "./database.types";

const COUNTED_STATUSES = ["SOORITATUD", "MITTE_SOORITATUD"] as const;

function applyFilters(
  eb: ExpressionBuilder<Database, "exams">,
  filters: DashboardFilters,
  options?: { includeCategory?: boolean },
) {
  const includeCategory = options?.includeCategory ?? true;
  const conditions = [eb("year", "in", filters.years)];

  if (includeCategory) {
    conditions.push(eb("kategooria", "=", filters.kategooria));
  }

  if (filters.byroo === "Tallinn") {
    conditions.push(eb("byroo", "like", "Tallinn%"));
  } else if (filters.byroo !== "all") {
    conditions.push(eb("byroo", "=", filters.byroo));
  }

  return eb.and(conditions);
}

const OUTCOME_LABELS: Record<string, string> = {
  SOORITATUD: "Passed",
  MITTE_SOORITATUD: "Failed",
  EI_ILMUNUD_KOHALE: "No-show",
  KATKESTATUD: "Interrupted",
};

const FAILURE_REASON_LABELS: Record<string, string> = {
  AJA_YLETAMINE: "Time exceeded",
  VALESTI_PARKITUD: "Incorrect parking",
  EBAPIISAV_ETTEVALMISTUS: "Unprepared",
  OHUSTAMINE: "Endangering others",
  VASTU_KOONUST: "Against convoy rules",
  SOIDUTEELT_VALJAS: "Left the road",
  OHU_TEKITAMINE: "Created danger",
  TAHISKOONUS: "Traffic sign",
  PARKIMINE_MARGISEL: "Parking at marker",
  VASTASSUUNDA: "Wrong direction",
};

function formatFailureReason(code: string): string {
  return (
    FAILURE_REASON_LABELS[code] ??
    code
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  );
}

export async function getOverviewStats(
  filters: DashboardFilters,
): Promise<OverviewStats> {
  const database = getDatabase();

  const row = await database
    .selectFrom("exams")
    .select([
      sql<number>`count(*)`.as("totalExams"),
      sql<number>`sum(case when seisund = 'SOORITATUD' then 1 else 0 end)`.as(
        "passedCount",
      ),
      sql<number>`sum(case when seisund = 'MITTE_SOORITATUD' then 1 else 0 end)`.as(
        "failedCount",
      ),
      sql<number>`sum(case when seisund = 'EI_ILMUNUD_KOHALE' then 1 else 0 end)`.as(
        "noShowCount",
      ),
      sql<number>`sum(case when seisund = 'KATKESTATUD' then 1 else 0 end)`.as(
        "interruptedCount",
      ),
      sql<number>`sum(case when seisund in ('SOORITATUD', 'MITTE_SOORITATUD') then 1 else 0 end)`.as(
        "countedAttempts",
      ),
    ])
    .where((eb) => applyFilters(eb, filters))
    .executeTakeFirstOrThrow();

  const countedAttempts = Number(row.countedAttempts);
  const passedCount = Number(row.passedCount);

  return {
    totalExams: Number(row.totalExams),
    passedCount,
    failedCount: Number(row.failedCount),
    noShowCount: Number(row.noShowCount),
    interruptedCount: Number(row.interruptedCount),
    successRate:
      countedAttempts > 0 ? (passedCount / countedAttempts) * 100 : 0,
  };
}

export async function getSuccessByOffice(
  filters: DashboardFilters,
): Promise<GroupSuccessStats[]> {
  const database = getDatabase();

  const rows = await database
    .selectFrom("exams")
    .select([
      "byroo as label",
      sql<number>`sum(case when seisund = 'SOORITATUD' then 1 else 0 end)`.as(
        "passedCount",
      ),
      sql<number>`sum(case when seisund = 'MITTE_SOORITATUD' then 1 else 0 end)`.as(
        "failedCount",
      ),
      sql<number>`sum(case when seisund in ('SOORITATUD', 'MITTE_SOORITATUD') then 1 else 0 end)`.as(
        "totalAttempts",
      ),
    ])
    .where((eb) => applyFilters(eb, { ...filters, byroo: "all" }))
    .groupBy("byroo")
    .having(
      sql`sum(case when seisund in ('SOORITATUD', 'MITTE_SOORITATUD') then 1 else 0 end)`,
      ">",
      0,
    )
    .orderBy(
      sql`sum(case when seisund = 'SOORITATUD' then 1 else 0 end) * 1.0 / nullif(sum(case when seisund in ('SOORITATUD', 'MITTE_SOORITATUD') then 1 else 0 end), 0)`,
      "desc",
    )
    .execute();

  return rows.map((row) => {
    const passedCount = Number(row.passedCount);
    const failedCount = Number(row.failedCount);
    const totalAttempts = Number(row.totalAttempts);

    return {
      label: row.label,
      passedCount,
      failedCount,
      totalAttempts,
      successRate:
        totalAttempts > 0 ? (passedCount / totalAttempts) * 100 : 0,
    };
  });
}

export async function getMonthlyTrend(
  filters: DashboardFilters,
): Promise<MonthlyTrendPoint[]> {
  const database = getDatabase();

  const rows = await database
    .selectFrom("exams")
    .select([
      "kuupaev as month",
      sql<number>`sum(case when seisund in ('SOORITATUD', 'MITTE_SOORITATUD') then 1 else 0 end)`.as(
        "totalAttempts",
      ),
      sql<number>`sum(case when seisund = 'SOORITATUD' then 1 else 0 end)`.as(
        "passedCount",
      ),
    ])
    .where((eb) => applyFilters(eb, filters))
    .groupBy("kuupaev")
    .orderBy("kuupaev")
    .execute();

  return rows.map((row) => {
    const totalAttempts = Number(row.totalAttempts);
    const passedCount = Number(row.passedCount);

    return {
      month: row.month,
      totalAttempts,
      successRate:
        totalAttempts > 0 ? (passedCount / totalAttempts) * 100 : 0,
    };
  });
}

export async function getExaminerStats(
  filters: DashboardFilters,
  minimumPassedCount = 20,
): Promise<GroupSuccessStats[]> {
  const database = getDatabase();

  const rows = await database
    .selectFrom("exams")
    .select([
      "eksamineerija as label",
      sql<number>`sum(case when seisund = 'SOORITATUD' then 1 else 0 end)`.as(
        "passedCount",
      ),
      sql<number>`sum(case when seisund = 'MITTE_SOORITATUD' then 1 else 0 end)`.as(
        "failedCount",
      ),
      sql<number>`sum(case when seisund in ('SOORITATUD', 'MITTE_SOORITATUD') then 1 else 0 end)`.as(
        "totalAttempts",
      ),
    ])
    .where((eb) =>
      eb.and([
        applyFilters(eb, filters),
        eb("seisund", "not in", ["KATKESTATUD", "EI_ILMUNUD_KOHALE"]),
      ]),
    )
    .groupBy("eksamineerija")
    .having(
      sql`sum(case when seisund = 'SOORITATUD' then 1 else 0 end)`,
      ">",
      minimumPassedCount,
    )
    .orderBy(
      sql`sum(case when seisund = 'SOORITATUD' then 1 else 0 end) * 1.0 / nullif(sum(case when seisund in ('SOORITATUD', 'MITTE_SOORITATUD') then 1 else 0 end), 0)`,
      "desc",
    )
    .execute();

  return rows.map((row) => {
    const passedCount = Number(row.passedCount);
    const failedCount = Number(row.failedCount);
    const totalAttempts = Number(row.totalAttempts);

    return {
      label: row.label,
      passedCount,
      failedCount,
      totalAttempts,
      successRate:
        totalAttempts > 0 ? (passedCount / totalAttempts) * 100 : 0,
    };
  });
}

export async function getDrivingSchoolStats(
  filters: DashboardFilters,
  minimumAttempts = 20,
): Promise<GroupSuccessStats[]> {
  const database = getDatabase();

  const rows = await database
    .selectFrom("exams")
    .select([
      sql<string>`coalesce(nullif(trim(viimane_autokool), ''), 'Unknown')`.as(
        "label",
      ),
      sql<number>`sum(case when seisund = 'SOORITATUD' then 1 else 0 end)`.as(
        "passedCount",
      ),
      sql<number>`sum(case when seisund = 'MITTE_SOORITATUD' then 1 else 0 end)`.as(
        "failedCount",
      ),
      sql<number>`sum(case when seisund in ('SOORITATUD', 'MITTE_SOORITATUD') then 1 else 0 end)`.as(
        "totalAttempts",
      ),
    ])
    .where((eb) =>
      eb.and([
        applyFilters(eb, filters),
        eb("seisund", "in", [...COUNTED_STATUSES]),
      ]),
    )
    .groupBy(sql`coalesce(nullif(trim(viimane_autokool), ''), 'Unknown')`)
    .having(
      sql`sum(case when seisund in ('SOORITATUD', 'MITTE_SOORITATUD') then 1 else 0 end)`,
      ">",
      minimumAttempts,
    )
    .orderBy(
      sql`sum(case when seisund in ('SOORITATUD', 'MITTE_SOORITATUD') then 1 else 0 end)`,
      "desc",
    )
    .execute();

  return rows.map((row) => {
    const passedCount = Number(row.passedCount);
    const failedCount = Number(row.failedCount);
    const totalAttempts = Number(row.totalAttempts);

    return {
      label: row.label,
      passedCount,
      failedCount,
      totalAttempts,
      successRate:
        totalAttempts > 0 ? (passedCount / totalAttempts) * 100 : 0,
    };
  });
}

export async function getOutlierSchools(
  filters: DashboardFilters,
  minimumFailuresPerCandidate = 4,
): Promise<OutlierSchoolStats[]> {
  const database = getDatabase();

  const candidateFailures = database
    .selectFrom("exams")
    .select([
      "viimane_autokool",
      "eksami_sooritaja",
      sql<number>`count(*)`.as("failureCount"),
    ])
    .where((eb) =>
      eb.and([
        applyFilters(eb, filters),
        eb("seisund", "=", "MITTE_SOORITATUD"),
      ]),
    )
    .groupBy(["viimane_autokool", "eksami_sooritaja"])
    .having(sql`count(*)`, ">=", minimumFailuresPerCandidate)
    .as("candidateFailures");

  const rows = await database
    .selectFrom(candidateFailures)
    .select([
      sql<string>`coalesce(nullif(trim(viimane_autokool), ''), 'Unknown')`.as(
        "drivingSchool",
      ),
      sql<number>`count(distinct eksami_sooritaja)`.as(
        "repeatFailureCandidates",
      ),
    ])
    .groupBy(sql`coalesce(nullif(trim(viimane_autokool), ''), 'Unknown')`)
    .orderBy("repeatFailureCandidates", "desc")
    .execute();

  return rows.map((row) => ({
    drivingSchool: row.drivingSchool,
    repeatFailureCandidates: Number(row.repeatFailureCandidates),
  }));
}

export async function getTopFailures(
  filters: DashboardFilters,
  limit = 10,
): Promise<TopFailureStats[]> {
  const database = getDatabase();

  const rows = await database
    .selectFrom("exams")
    .select([
      "eksami_sooritaja as candidateId",
      "kategooria",
      sql<number>`count(*)`.as("failureCount"),
    ])
    .where((eb) =>
      eb.and([
        applyFilters(eb, filters),
        eb("seisund", "=", "MITTE_SOORITATUD"),
      ]),
    )
    .groupBy(["eksami_sooritaja", "kategooria"])
    .orderBy("failureCount", "desc")
    .limit(limit)
    .execute();

  return rows.map((row) => ({
    candidateId: row.candidateId,
    kategooria: row.kategooria,
    failureCount: Number(row.failureCount),
  }));
}

export async function getAvailableOffices(
  filters: Pick<DashboardFilters, "years" | "kategooria">,
): Promise<string[]> {
  const database = getDatabase();

  const rows = await database
    .selectFrom("exams")
    .select("byroo")
    .distinct()
    .where("year", "in", filters.years)
    .where("kategooria", "=", filters.kategooria)
    .orderBy("byroo")
    .execute();

  return rows.map((row) => row.byroo);
}

export async function getOutcomeBreakdown(
  filters: DashboardFilters,
): Promise<OutcomeBreakdownPoint[]> {
  const database = getDatabase();

  const rows = await database
    .selectFrom("exams")
    .select(["seisund", sql<number>`count(*)`.as("count")])
    .where((eb) => applyFilters(eb, filters))
    .groupBy("seisund")
    .orderBy("count", "desc")
    .execute();

  const total = rows.reduce((sum, row) => sum + Number(row.count), 0);

  return rows.map((row) => {
    const count = Number(row.count);

    return {
      outcome: OUTCOME_LABELS[row.seisund] ?? row.seisund,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    };
  });
}

export async function getSuccessByCategory(
  filters: DashboardFilters,
  minimumAttempts = 20,
): Promise<GroupSuccessStats[]> {
  const database = getDatabase();

  const rows = await database
    .selectFrom("exams")
    .select([
      "kategooria as label",
      sql<number>`sum(case when seisund = 'SOORITATUD' then 1 else 0 end)`.as(
        "passedCount",
      ),
      sql<number>`sum(case when seisund = 'MITTE_SOORITATUD' then 1 else 0 end)`.as(
        "failedCount",
      ),
      sql<number>`sum(case when seisund in ('SOORITATUD', 'MITTE_SOORITATUD') then 1 else 0 end)`.as(
        "totalAttempts",
      ),
    ])
    .where((eb) => applyFilters(eb, filters, { includeCategory: false }))
    .groupBy("kategooria")
    .having(
      sql`sum(case when seisund in ('SOORITATUD', 'MITTE_SOORITATUD') then 1 else 0 end)`,
      ">",
      minimumAttempts,
    )
    .orderBy(
      sql`sum(case when seisund in ('SOORITATUD', 'MITTE_SOORITATUD') then 1 else 0 end)`,
      "desc",
    )
    .execute();

  return rows.map((row) => {
    const passedCount = Number(row.passedCount);
    const failedCount = Number(row.failedCount);
    const totalAttempts = Number(row.totalAttempts);

    return {
      label: row.label,
      passedCount,
      failedCount,
      totalAttempts,
      successRate:
        totalAttempts > 0 ? (passedCount / totalAttempts) * 100 : 0,
    };
  });
}

export async function getTopFailureReasons(
  filters: DashboardFilters,
  limit = 10,
): Promise<FailureReasonPoint[]> {
  const database = getDatabase();

  const rows = await database
    .selectFrom("exams")
    .select("vead")
    .where((eb) =>
      eb.and([
        applyFilters(eb, filters),
        eb("seisund", "=", "MITTE_SOORITATUD"),
        eb("vead", "is not", null),
        eb("vead", "!=", ""),
      ]),
    )
    .execute();

  const reasonCounts = new Map<string, number>();

  for (const row of rows) {
    if (!row.vead) {
      continue;
    }

    for (const reason of row.vead.split("|")) {
      const trimmedReason = reason.trim();

      if (!trimmedReason) {
        continue;
      }

      reasonCounts.set(
        trimmedReason,
        (reasonCounts.get(trimmedReason) ?? 0) + 1,
      );
    }
  }

  return [...reasonCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([reason, count]) => ({
      reason,
      label: formatFailureReason(reason),
      count,
    }));
}

export async function getPassRateByAttemptNumber(
  filters: DashboardFilters,
  maxAttempt = 6,
): Promise<AttemptPassRatePoint[]> {
  const database = getDatabase();

  const numberedExams = database
    .selectFrom("exams")
    .select([
      "seisund",
      sql<number>`row_number() over (
        partition by eksami_sooritaja, kategooria
        order by kuupaev, id
      )`.as("attemptNumber"),
    ])
    .where((eb) =>
      eb.and([
        applyFilters(eb, filters),
        eb("seisund", "in", [...COUNTED_STATUSES]),
      ]),
    )
    .as("numberedExams");

  const rows = await database
    .selectFrom(numberedExams)
    .select([
      "attemptNumber",
      sql<number>`sum(case when seisund = 'SOORITATUD' then 1 else 0 end)`.as(
        "passedCount",
      ),
      sql<number>`count(*)`.as("totalAttempts"),
    ])
    .where("attemptNumber", "<=", maxAttempt)
    .groupBy("attemptNumber")
    .orderBy("attemptNumber")
    .execute();

  return rows.map((row) => {
    const attemptNumber = Number(row.attemptNumber);
    const passedCount = Number(row.passedCount);
    const totalAttempts = Number(row.totalAttempts);

    return {
      attemptNumber,
      attemptLabel:
        attemptNumber === 1
          ? "1st attempt"
          : attemptNumber === 2
            ? "2nd attempt"
            : attemptNumber === 3
              ? "3rd attempt"
              : `${attemptNumber}th attempt`,
      totalAttempts,
      passedCount,
      successRate:
        totalAttempts > 0 ? (passedCount / totalAttempts) * 100 : 0,
    };
  });
}

export async function getAvailableYears(): Promise<number[]> {
  const database = getDatabase();

  const rows = await database
    .selectFrom("exams")
    .select("year")
    .distinct()
    .orderBy("year")
    .execute();

  return rows.map((row) => row.year);
}

export async function getAvailableCategories(
  years: number[],
): Promise<string[]> {
  const database = getDatabase();

  const rows = await database
    .selectFrom("exams")
    .select("kategooria")
    .distinct()
    .where("year", "in", years)
    .orderBy("kategooria")
    .execute();

  return rows.map((row) => row.kategooria);
}
