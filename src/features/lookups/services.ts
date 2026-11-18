import { api } from "@/lib/api/client";
import type { AdminLookup } from "@/lib/api/types";

/** GET /admin/business-types: all of them, inactive ones too, by `sort_order`. Needs `manage-lookups`. */
export async function listBusinessTypes(): Promise<AdminLookup[]> {
  const { data } = await api.get<{ data: AdminLookup[] }>("/admin/business-types");
  return data.data;
}
