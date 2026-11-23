import type { PackageDuration } from "@/lib/api/types";

/** The durations a package can be sold for, in the order they are shown. */
export const durations = [1, 3, 12] as const satisfies readonly PackageDuration[];

export const durationLabels: Record<PackageDuration, string> = { 1: "شهر", 3: "3 أشهر", 12: "سنة" };

export function cardsLimitLabel(count: number): string {
  if (count === 1) return "بطاقة واحدة";
  if (count === 2) return "بطاقتان";
  return count <= 10 ? `${count} بطاقات` : `${count} بطاقة`;
}

export function campaignsLimitLabel(count: number): string {
  if (count === 0) return "بدون حملات";
  if (count === 1) return "حملة أسبوعياً";
  if (count === 2) return "حملتان أسبوعياً";
  return count <= 10 ? `${count} حملات أسبوعياً` : `${count} حملة أسبوعياً`;
}
