import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  exams: ExamsTable;
}

export interface ExamsTable {
  id: Generated<number>;
  eksami_sooritaja: string;
  kuupaev: string;
  byroo: string;
  kategooria: string;
  eritingimused: string | null;
  viimane_autokool: string | null;
  soiduopetaja_kaasas: string | null;
  eksamineerija: string;
  seisund: string;
  kestus: number | null;
  katk_pohjus: string | null;
  mittearvestatud: string | null;
  vead: string | null;
  year: number;
}

export type Exam = Selectable<ExamsTable>;
export type NewExam = Insertable<ExamsTable>;
export type ExamUpdate = Updateable<ExamsTable>;

export interface DashboardFilters {
  years: number[];
  kategooria: string;
  byroo: string;
}

export interface OverviewStats {
  totalExams: number;
  passedCount: number;
  failedCount: number;
  noShowCount: number;
  interruptedCount: number;
  successRate: number;
}

export interface GroupSuccessStats {
  label: string;
  passedCount: number;
  failedCount: number;
  totalAttempts: number;
  successRate: number;
}

export interface MonthlyTrendPoint {
  month: string;
  totalAttempts: number;
  successRate: number;
}

export interface OutlierSchoolStats {
  drivingSchool: string;
  repeatFailureCandidates: number;
}

export interface TopFailureStats {
  candidateId: string;
  failureCount: number;
  kategooria: string;
}

export interface OutcomeBreakdownPoint {
  outcome: string;
  count: number;
  percentage: number;
}

export interface FailureReasonPoint {
  reason: string;
  label: string;
  count: number;
}

export interface AttemptPassRatePoint {
  attemptNumber: number;
  attemptLabel: string;
  totalAttempts: number;
  passedCount: number;
  successRate: number;
}
