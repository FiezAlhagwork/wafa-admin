// Display formatting. Dates arrive in UTC (ISO 8601) and are shown in Damascus time, always with Latin digits.
// Amounts arrive as decimal strings ("10.00") and are only displayed: never parseFloat them, never do math on them.

const TIME_ZONE = "Asia/Damascus";
// `-u-nu-latn` forces Latin digits inside the Arabic locale
const LOCALE = "ar-u-nu-latn";

const dateFormat = new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, day: "numeric", month: "long", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit" });
const numberFormat = new Intl.NumberFormat("en-US");

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

/** "9:20 ص". */
export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso));
}

/**
 * "14 نوفمبر 2026 · 9:20 ص". Built from two parts on purpose: the single Intl format puts an Arabic comma between
 * them that the font draws like a full stop, which reads as part of the year.
 */
export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

/** A count, with thousands separators: 12480 → "12,480". */
export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** "2026-10" → "تشرين الأول 2026". */
export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  // Noon UTC on the 15th: far enough from midnight that the zone can never move it to another month
  return new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, month: "long", year: "numeric" }).format(
    new Date(Date.UTC(year, month - 1, 15, 12)),
  );
}

// Groups the integer part with commas by string only ("591500.00" → "591,500.00"), so no number is ever parsed.
const withGrouping = (amount: string) => amount.replace(/^(-?\d+)/, (integer) => integer.replace(/\B(?=(\d{3})+(?!\d))/g, ","));

/** A decimal string with grouping and its decimals kept ("13000.50" → "13,000.50"): for rates and similar. */
export const formatDecimal = withGrouping;

/**
 * A typed amount as the server writes it: "18" → "18.00", "18.5" → "18.50". By text only, to compare a form value
 * with a stored one: amounts are never parsed to floats.
 */
export function normalizeAmount(value: string): string {
  const [whole, fraction = ""] = value.trim().split(".");
  return `${whole.replace(/^0+(?=\d)/, "")}.${fraction.padEnd(2, "0")}`;
}

export const formatUsd = (amount: string) => `$${withGrouping(amount)}`;

/** Syrian pounds, without the decimals ("591500.00" → "591,500 ل.س"): the cents of a pound mean nothing. */
export const formatSyp = (amount: string) => `${withGrouping(amount.replace(/\.\d+$/, ""))} ل.س`;

// Calendar-day arithmetic in Damascus time: both dates are reduced to their Damascus day first, so "tomorrow"
// never flips because of the hour or the UTC offset. `en-CA` formats as YYYY-MM-DD.
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const MS_PER_DAY = 86_400_000;

function damascusDayNumber(date: Date): number {
  const [year, month, day] = dayKeyFormat.format(date).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

/** A number of days with the right Arabic form: "يوم واحد" · "يومان" · "5 أيام" · "12 يوماً". */
export function formatDayCount(days: number): string {
  if (days === 1) return "يوم واحد";
  if (days === 2) return "يومان";
  return `${days} ${days >= 3 && days <= 10 ? "أيام" : "يوماً"}`;
}

/** "اليوم" · "غداً" · "بعد يومين" · "بعد 5 أيام" · "بعد 12 يوماً" (and the past: "أمس" · "منذ 3 أيام"...). */
export function formatRelativeDays(iso: string, now: Date = new Date()): string {
  const days = Math.round(damascusDayNumber(new Date(iso)) - damascusDayNumber(now));
  const count = Math.abs(days);
  const unit = count >= 11 ? "يوماً" : "أيام";

  if (days === 0) return "اليوم";
  if (days === 1) return "غداً";
  if (days === -1) return "أمس";
  if (count === 2) return days > 0 ? "بعد يومين" : "منذ يومين";
  return days > 0 ? `بعد ${count} ${unit}` : `منذ ${count} ${unit}`;
}

/** Whole years: "سنة واحدة" · "سنتان" · "5 سنوات" · "27 سنة". */
export function formatYears(years: number): string {
  if (years === 1) return "سنة واحدة";
  if (years === 2) return "سنتان";
  return `${years} ${years >= 3 && years <= 10 ? "سنوات" : "سنة"}`;
}

/** Age in whole years from a "YYYY-MM-DD" birthdate, on Damascus calendar days. */
export function ageFromBirthdate(birthdate: string, now: Date = new Date()): number {
  const [year, month, day] = birthdate.split("-").map(Number);
  const [nowYear, nowMonth, nowDay] = dayKeyFormat.format(now).split("-").map(Number);
  const hadBirthday = nowMonth > month || (nowMonth === month && nowDay >= day);
  return nowYear - year - (hadBirthday ? 0 : 1);
}

/** A "YYYY-MM-DD" day (a birthdate), without moving it through a time zone: "12 أبريل 1996". */
export function formatDay(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Intl.DateTimeFormat(LOCALE, { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(
    new Date(Date.UTC(year, month - 1, date, 12)),
  );
}

/** Today in Damascus as "YYYY-MM-DD" (the `max` of a date field). */
export function todayKey(now: Date = new Date()): string {
  return dayKeyFormat.format(now);
}

/**
 * Arabic count forms: [one, two, 3–10, 11–99, hundreds]. The noun follows the last two digits:
 * "5 دقائق" · "60 دقيقة" · "300 حرف" · "60 حرفاً".
 */
export type CountForms = readonly [string, string, string, string, string];

export function formatCount(value: number, [one, two, few, many, hundreds]: CountForms): string {
  if (value === 1) return one;
  if (value === 2) return two;
  const lastTwo = value % 100;
  if (lastTwo >= 3 && lastTwo <= 10) return `${value} ${few}`;
  if (lastTwo >= 11) return `${value} ${many}`;
  return `${value} ${hundreds}`;
}
