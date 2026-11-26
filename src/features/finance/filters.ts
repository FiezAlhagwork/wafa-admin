import type { PaymentMethod, PaymentStatus } from "@/lib/api/types";
import { todayKey } from "@/lib/format";

export type FinanceView = "report" | "payments";
export type PeriodPreset = "all" | "this_month" | "last_month" | "last_3_months" | "this_year" | "custom";
export type HistoryStatus = PaymentStatus | "";
export type HistoryMethod = PaymentMethod | "";

/** The period as the URL keeps it: a preset (so a saved link stays "this month"), or two days for `custom`. */
export type Period = { preset: PeriodPreset; from: string; to: string };

export type FinanceFilters = {
  view: FinanceView;
  period: Period;
  /** The payments history only. */
  status: HistoryStatus;
  method: HistoryMethod;
  merchantId: number | null;
};

/** What the server gets: two "YYYY-MM-DD" days, either of them may be missing. */
export type DayRange = { from?: string; to?: string };

const presetsOf: Record<FinanceView, PeriodPreset[]> = {
  // The report has no "all time": without dates the server counts this month
  report: ["this_month", "last_month", "last_3_months", "this_year", "custom"],
  payments: ["all", "this_month", "last_month", "last_3_months", "this_year", "custom"],
};

export const defaultPreset: Record<FinanceView, PeriodPreset> = { report: "this_month", payments: "all" };

export const presetLabels: Record<PeriodPreset, string> = {
  all: "كل الفترات",
  this_month: "هذا الشهر",
  last_month: "الشهر الماضي",
  last_3_months: "آخر 3 أشهر",
  this_year: "هذه السنة",
  custom: "فترة مخصّصة",
};

export const presetOptions = (view: FinanceView) =>
  presetsOf[view].map((value) => ({ value, label: presetLabels[value] }));

const statuses: HistoryStatus[] = ["PENDING", "APPROVED", "REJECTED"];
const methods: HistoryMethod[] = ["sham_cash", "haram"];
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const day = (value: string | null) => (value && DAY.test(value) ? value : "");

/**
 * `?view=payments&period=last_month&status=APPROVED&method=haram&merchant_id=12`, or `period=custom&from=…&to=…`.
 * Anything unknown falls back to the view's default.
 */
export function parseFilters(params: URLSearchParams): FinanceFilters {
  const view: FinanceView = params.get("view") === "payments" ? "payments" : "report";
  const preset = params.get("period") as PeriodPreset | null;
  const status = params.get("status") ?? "";
  const method = params.get("method") ?? "";
  const merchantId = Number(params.get("merchant_id"));
  const history = view === "payments";

  return {
    view,
    period: {
      preset: preset && presetsOf[view].includes(preset) ? preset : defaultPreset[view],
      from: day(params.get("from")),
      to: day(params.get("to")),
    },
    status: history && statuses.includes(status as HistoryStatus) ? (status as HistoryStatus) : "",
    method: history && methods.includes(method as HistoryMethod) ? (method as HistoryMethod) : "",
    merchantId: history && Number.isInteger(merchantId) && merchantId > 0 ? merchantId : null,
  };
}

/** The defaults stay out of the URL. The report never carries the history's filters. */
export function filtersToSearch({ view, period, status, method, merchantId }: FinanceFilters): string {
  const params = new URLSearchParams();
  if (view === "payments") params.set("view", view);
  if (period.preset !== defaultPreset[view]) params.set("period", period.preset);
  if (period.preset === "custom") {
    if (period.from) params.set("from", period.from);
    if (period.to) params.set("to", period.to);
  }
  if (view === "payments") {
    if (status) params.set("status", status);
    if (method) params.set("method", method);
    if (merchantId) params.set("merchant_id", String(merchantId));
  }
  const search = params.toString();
  return search ? `?${search}` : "";
}

const pad = (value: number) => String(value).padStart(2, "0");
const monthStart = (year: number, month: number) => `${year}-${pad(month)}-01`;
// Day 0 of the next month is the last day of this one
const monthEnd = (year: number, month: number) => `${year}-${pad(month)}-${pad(new Date(Date.UTC(year, month, 0)).getUTCDate())}`;
/** The month `offset` months before (year, month), as [year, month]. */
const monthsBack = (year: number, month: number, offset: number): [number, number] => {
  const index = year * 12 + (month - 1) - offset;
  return [Math.floor(index / 12), (index % 12) + 1];
};

/** A custom period whose start is after its end: the screen says so and asks nothing. */
export const isBackwards = ({ preset, from, to }: Period) => preset === "custom" && !!from && !!to && from > to;

/** The days a period means, on Damascus calendar days. `all` sends nothing. */
export function periodRange({ preset, from, to }: Period, now: Date = new Date()): DayRange {
  const today = todayKey(now);
  const [year, month] = today.split("-").map(Number);

  switch (preset) {
    case "all":
      return {};
    case "this_month":
      return { from: monthStart(year, month), to: today };
    case "last_month": {
      const [y, m] = monthsBack(year, month, 1);
      return { from: monthStart(y, m), to: monthEnd(y, m) };
    }
    case "last_3_months": {
      // This month and the two before it
      const [y, m] = monthsBack(year, month, 2);
      return { from: monthStart(y, m), to: today };
    }
    case "this_year":
      return { from: `${year}-01-01`, to: today };
    case "custom":
      return { from: from || undefined, to: to || undefined };
  }
}
