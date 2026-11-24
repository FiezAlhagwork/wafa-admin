import { api } from "@/lib/api/client";
import type { AdminLookup, CreateIconBody, UpdateLookupBody } from "@/lib/api/types";
import { kindText, type LookupKind } from "./kinds";

/** GET /admin/business-types or /admin/icons: all of them, inactive ones too, by `sort_order`. Needs `manage-lookups`. */
export async function listLookups(kind: LookupKind): Promise<AdminLookup[]> {
  const { data } = await api.get<{ data: AdminLookup[] }>(kindText[kind].path);
  return data.data;
}

export const listBusinessTypes = () => listLookups("types");

/** A business type takes no `key`; an icon must have one (a Phosphor icon name, fixed once created). */
export type CreateLookupBody = Omit<CreateIconBody, "key"> & { key?: string };

/** POST: an active entry shows in the apps right away. */
export async function createLookup({ kind, ...body }: CreateLookupBody & { kind: LookupKind }): Promise<AdminLookup> {
  const { data } = await api.post<{ data: AdminLookup }>(kindText[kind].path, body);
  return data.data;
}

/** PATCH: only the fields sent change. No delete: `is_active: false`. */
export async function updateLookup({
  kind,
  id,
  ...body
}: UpdateLookupBody & { kind: LookupKind; id: number }): Promise<AdminLookup> {
  const { data } = await api.patch<{ data: AdminLookup }>(`${kindText[kind].path}/${id}`, body);
  return data.data;
}
