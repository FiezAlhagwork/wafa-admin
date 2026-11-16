import { api } from "@/lib/api/client";
import type { AdminOverview } from "@/lib/api/types";

/** GET /admin/overview: any role. `finance` is null without `view-financials`. */
export async function getOverview(): Promise<AdminOverview> {
  const { data } = await api.get<{ data: AdminOverview }>("/admin/overview");
  return data.data;
}
