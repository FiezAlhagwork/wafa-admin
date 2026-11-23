// Packages for the development preview (/dev/shell). Never imported outside /dev.
// Each preview gets its own copy (`createPackageStore`), so adding or editing a package really changes it.

import type { AdminPackage, CreatePackageBody, PackageDuration, UpdatePackageBody } from "@/lib/api/types";

const seeds: AdminPackage[] = [
  {
    id: 1,
    name: "الأساسية",
    cards_limit: 1,
    weekly_campaigns_limit: 0,
    is_active: true,
    sort_order: 1,
    prices: [
      { duration_months: 1, price_usd: "15.00" },
      { duration_months: 3, price_usd: "40.00" },
      { duration_months: 12, price_usd: "150.00" },
    ],
  },
  {
    id: 2,
    name: "المتوسطة",
    cards_limit: 2,
    weekly_campaigns_limit: 2,
    is_active: true,
    sort_order: 2,
    prices: [
      { duration_months: 1, price_usd: "18.00" },
      { duration_months: 3, price_usd: "46.00" },
      { duration_months: 12, price_usd: "163.00" },
    ],
  },
  {
    id: 3,
    name: "المتقدمة",
    cards_limit: 5,
    weekly_campaigns_limit: 5,
    is_active: true,
    sort_order: 3,
    prices: [
      { duration_months: 1, price_usd: "35.00" },
      { duration_months: 3, price_usd: "90.00" },
    ],
  },
  {
    id: 4,
    name: "القديمة",
    cards_limit: 3,
    weekly_campaigns_limit: 1,
    is_active: false,
    sort_order: 9,
    prices: [{ duration_months: 1, price_usd: "12.00" }],
  },
];

type Fields = Record<string, string[]>;
export type PackageResult = { ok: true; data: AdminPackage } | { ok: false; fields: Fields } | { ok: false; notFound: true };

const money = (value: number) => value.toFixed(2);
const durationOrder: PackageDuration[] = [1, 3, 12];

/** The server's rules (guide §5.8), so the preview shows the same field errors. */
function validate(body: UpdatePackageBody, all: AdminPackage[], selfId: number | null, creating: boolean): Fields {
  const fields: Fields = {};
  const range = (name: keyof UpdatePackageBody, value: number | undefined, min: number, max: number) => {
    if (value === undefined) {
      if (creating) fields[name] = ["required"];
      return;
    }
    if (!Number.isInteger(value) || value < min) fields[name] = ["min"];
    else if (value > max) fields[name] = ["max"];
  };
  if (body.name !== undefined || creating) {
    const name = body.name?.trim() ?? "";
    if (name.length < 2) fields.name = [name ? "min" : "required"];
    else if (name.length > 100) fields.name = ["max"];
    else if (all.some((item) => item.id !== selfId && item.name === name)) fields.name = ["taken"];
  }
  range("cards_limit", body.cards_limit, 1, 20);
  range("weekly_campaigns_limit", body.weekly_campaigns_limit, 0, 20);
  if (body.sort_order !== undefined && (body.sort_order < 0 || body.sort_order > 1000)) fields.sort_order = ["max"];
  if (creating && !body.prices?.length) fields.prices = ["required"];
  body.prices?.forEach((price, index) => {
    if (price.price_usd === null) {
      if (creating) fields[`prices.${index}.price_usd`] = ["required"];
    } else if (price.price_usd < 0.01) fields[`prices.${index}.price_usd`] = ["min"];
  });
  return fields;
}

export function createPackageStore() {
  const packages = seeds.map((item) => ({ ...item, prices: item.prices.map((price) => ({ ...price })) }));
  const sorted = () => [...packages].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  const applyPrices = (pkg: AdminPackage, changes: NonNullable<UpdatePackageBody["prices"]>) => {
    for (const change of changes) {
      pkg.prices = pkg.prices.filter((item) => item.duration_months !== change.duration_months);
      if (change.price_usd !== null) pkg.prices.push({ duration_months: change.duration_months, price_usd: money(change.price_usd) });
    }
    pkg.prices.sort((a, b) => durationOrder.indexOf(a.duration_months) - durationOrder.indexOf(b.duration_months));
  };

  return {
    list: sorted,

    create(body: CreatePackageBody): PackageResult {
      const fields = validate(body, packages, null, true);
      if (Object.keys(fields).length > 0) return { ok: false, fields };
      const created: AdminPackage = {
        id: Math.max(...packages.map((item) => item.id)) + 1,
        name: body.name.trim(),
        cards_limit: body.cards_limit,
        weekly_campaigns_limit: body.weekly_campaigns_limit,
        is_active: body.is_active ?? true,
        // The real default is not documented yet (asked in Notion A10); 0 here, so a new package may come first
        sort_order: body.sort_order ?? 0,
        prices: [],
      };
      applyPrices(created, body.prices);
      packages.push(created);
      return { ok: true, data: created };
    },

    update(id: number, body: UpdatePackageBody): PackageResult {
      const pkg = packages.find((item) => item.id === id);
      if (!pkg) return { ok: false, notFound: true };
      const fields = validate(body, packages, id, false);
      if (Object.keys(fields).length > 0) return { ok: false, fields };
      const { prices, ...rest } = body;
      Object.assign(pkg, rest, rest.name !== undefined && { name: rest.name.trim() });
      if (prices) applyPrices(pkg, prices);
      return { ok: true, data: pkg };
    },
  };
}
