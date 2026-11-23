import { api } from "@/lib/api/client";
import type { AdminPackage, CreatePackageBody, UpdatePackageBody } from "@/lib/api/types";

/** GET /admin/packages: every package, the inactive ones too, by `sort_order`. No cursor (a handful of packages). */
export async function listPackages(): Promise<AdminPackage[]> {
  const { data } = await api.get<{ data: AdminPackage[] }>("/admin/packages");
  return data.data;
}

/** POST /admin/packages: an active package shows in the merchant app right away. */
export async function createPackage(body: CreatePackageBody): Promise<AdminPackage> {
  const { data } = await api.post<{ data: AdminPackage }>("/admin/packages", body);
  return data.data;
}

/**
 * PATCH /admin/packages/{id}: only the fields sent change. In `prices`, each duration sent is set and
 * `price_usd: null` removes it; the durations not sent stay. No delete: `is_active: false`.
 */
export async function updatePackage({ id, ...body }: UpdatePackageBody & { id: number }): Promise<AdminPackage> {
  const { data } = await api.patch<{ data: AdminPackage }>(`/admin/packages/${id}`, body);
  return data.data;
}
