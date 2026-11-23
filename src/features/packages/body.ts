import type { AdminPackage, CreatePackageBody, PackageDuration, UpdatePackageBody } from "@/lib/api/types";
import { durations } from "./labels";
import { priceField, type PackageFormValues } from "./schemas";

type PriceChange = { duration_months: PackageDuration; price_usd: number | null };

/** "18" and "18.5" as the server writes them ("18.00", "18.50"), by text only: amounts are never parsed to floats. */
export function normalizePrice(value: string): string {
  const [whole, fraction = ""] = value.trim().split(".");
  return `${whole.replace(/^0+(?=\d)/, "")}.${fraction.padEnd(2, "0")}`;
}

/** The form's text for a stored price: "18.00" stays, so the field shows what the app shows. */
export const priceText = (pkg: AdminPackage | null, months: PackageDuration) =>
  pkg?.prices.find((item) => item.duration_months === months)?.price_usd ?? "";

// The API takes numbers. `Number` here converts the validated text for the request; no math is done on it.
const toNumber = (text: string) => Number(normalizePrice(text));

export function toCreateBody(values: PackageFormValues): CreatePackageBody {
  const prices = durations
    .filter((months) => values[priceField(months)] !== "")
    .map((months) => ({ duration_months: months, price_usd: toNumber(values[priceField(months)]) }));
  return {
    name: values.name.trim(),
    cards_limit: Number(values.cards_limit),
    weekly_campaigns_limit: Number(values.weekly_campaigns_limit),
    ...(values.sort_order.trim() !== "" && { sort_order: Number(values.sort_order) }),
    prices,
  };
}

/**
 * Only what changed (the server applies each field sent). A price that was there and is now empty is sent as
 * `null`, which removes that duration; an untouched duration is not sent.
 */
export function toUpdateBody(pkg: AdminPackage, values: PackageFormValues): UpdatePackageBody {
  const body: UpdatePackageBody = {};
  if (values.name.trim() !== pkg.name) body.name = values.name.trim();
  if (Number(values.cards_limit) !== pkg.cards_limit) body.cards_limit = Number(values.cards_limit);
  if (Number(values.weekly_campaigns_limit) !== pkg.weekly_campaigns_limit) {
    body.weekly_campaigns_limit = Number(values.weekly_campaigns_limit);
  }
  if (values.sort_order.trim() !== "" && Number(values.sort_order) !== pkg.sort_order) {
    body.sort_order = Number(values.sort_order);
  }

  const prices: PriceChange[] = [];
  for (const months of durations) {
    const before = priceText(pkg, months);
    const after = values[priceField(months)].trim();
    if (after === "" && before !== "") prices.push({ duration_months: months, price_usd: null });
    else if (after !== "" && (before === "" || normalizePrice(after) !== normalizePrice(before))) {
      prices.push({ duration_months: months, price_usd: toNumber(after) });
    }
  }
  if (prices.length > 0) body.prices = prices;
  return body;
}

/** Which kinds of change the form holds, for the notes under it (limits apply to every merchant at once). */
export function pendingChanges(pkg: AdminPackage, values: PackageFormValues) {
  const body = toUpdateBody(pkg, values);
  return {
    limits: body.cards_limit !== undefined || body.weekly_campaigns_limit !== undefined,
    prices: body.prices !== undefined,
  };
}
