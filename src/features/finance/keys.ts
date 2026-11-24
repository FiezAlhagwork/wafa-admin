import type { DayRange, HistoryMethod, HistoryStatus } from "./filters";

export type HistoryParams = DayRange & { status: HistoryStatus; method: HistoryMethod; merchantId: number | null };

export const financeKeys = {
  /** Invalidated after a payment is approved or rejected: the report and the history both change. */
  all: ["finance"] as const,
  /** The resolved days are the key ("this month" moves at midnight). */
  report: (range: DayRange) => [...financeKeys.all, "report", range] as const,
  history: (params: HistoryParams) => [...financeKeys.all, "history", params] as const,
};
