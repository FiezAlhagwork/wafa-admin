// Business types and card icons for the development preview (/dev/shell). Never imported outside /dev.
// Each preview gets its own copy (`createLookupStore`), so adding or editing really changes it.

import type { AdminLookup, UpdateLookupBody } from "@/lib/api/types";
import type { CreateLookupBody } from "@/features/lookups/services";
import { businessTypes } from "./mock-merchants";

const iconSeeds: [key: string, name: string][] = [
  ["coffee", "قهوة"],
  ["cake", "حلويات"],
  ["fork-knife", "مطعم"],
  ["scissors", "حلاقة"],
  ["barbell", "رياضة"],
  ["book-open", "كتب"],
  ["bread", "مخبز"],
  ["pizza", "بيتزا"],
  ["t-shirt", "ملابس"],
  ["ice-cream", "بوظة"],
];

type Fields = Record<string, string[]>;
export type LookupResult = { ok: true; data: AdminLookup } | { ok: false; fields: Fields } | { ok: false; notFound: true };
type Kind = "types" | "icons";

const bySortOrder = (a: AdminLookup, b: AdminLookup) => a.sort_order - b.sort_order || a.id - b.id;

export function createLookupStore() {
  const lists: Record<Kind, AdminLookup[]> = {
    types: businessTypes.map((type) => ({ ...type })),
    // The last one is inactive, to show how an inactive icon looks
    icons: iconSeeds.map(([key, name], index) => ({
      id: index + 1,
      key,
      name,
      sort_order: index + 1,
      is_active: index !== iconSeeds.length - 1,
    })),
  };

  /** The server's rules: the name 2–100 and not taken, the order 0–65535; an icon's key is required, valid and new. */
  const validate = (kind: Kind, body: CreateLookupBody | UpdateLookupBody, selfId: number | null, iconExists?: boolean) => {
    const fields: Fields = {};
    const creating = selfId === null;
    if (body.name !== undefined || creating) {
      const name = body.name?.trim() ?? "";
      if (name.length < 2) fields.name = [name ? "min" : "required"];
      else if (name.length > 100) fields.name = ["max"];
      else if (lists[kind].some((item) => item.id !== selfId && item.name === name)) fields.name = ["taken"];
    }
    if (body.sort_order !== undefined && (!Number.isInteger(body.sort_order) || body.sort_order < 0 || body.sort_order > 65535)) {
      fields.sort_order = ["max"];
    }
    if (kind === "icons" && creating) {
      const key = "key" in body ? (body.key ?? "") : "";
      if (!key) fields.key = ["required"];
      else if (key.length > 64) fields.key = ["max"];
      else if (!iconExists) fields.key = ["invalid"];
      else if (lists.icons.some((item) => item.key === key)) fields.key = ["taken"];
    }
    return fields;
  };

  return {
    list: (kind: Kind) => [...lists[kind]].sort(bySortOrder),
    /** For the merchant actions: the business types as they are now. */
    types: () => lists.types,

    create(kind: Kind, body: CreateLookupBody, iconExists: boolean): LookupResult {
      const fields = validate(kind, body, null, iconExists);
      if (Object.keys(fields).length > 0) return { ok: false, fields };
      const list = lists[kind];
      const created: AdminLookup = {
        id: Math.max(0, ...list.map((item) => item.id)) + 1,
        ...(kind === "icons" && { key: body.key }),
        name: body.name.trim(),
        // No order sent: after the last one, like the server's default
        sort_order: body.sort_order ?? Math.max(0, ...list.map((item) => item.sort_order)) + 1,
        is_active: body.is_active ?? true,
      };
      list.push(created);
      return { ok: true, data: created };
    },

    update(kind: Kind, id: number, body: UpdateLookupBody): LookupResult {
      const item = lists[kind].find((entry) => entry.id === id);
      if (!item) return { ok: false, notFound: true };
      const fields = validate(kind, body, id);
      if (Object.keys(fields).length > 0) return { ok: false, fields };
      if (body.name !== undefined) item.name = body.name.trim();
      if (body.sort_order !== undefined) item.sort_order = body.sort_order;
      if (body.is_active !== undefined) item.is_active = body.is_active;
      return { ok: true, data: item };
    },
  };
}
