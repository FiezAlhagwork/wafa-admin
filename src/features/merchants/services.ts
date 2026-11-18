import { api } from "@/lib/api/client";
import type { AdminMerchant, AdminMerchantDetail } from "@/lib/api/types";
import type { MerchantsQuery } from "./keys";

const PAGE_SIZE = 20;

export type MerchantsPage = { merchants: AdminMerchant[]; nextCursor: string | null };

/** GET /admin/merchants: newest registration first, by cursor. Merchants still registering are in the list too (`status: null`). */
export async function listMerchants({ query, cursor }: { query: MerchantsQuery; cursor?: string }): Promise<MerchantsPage> {
  const { data } = await api.get<{ data: AdminMerchant[]; meta: { next_cursor: string | null } }>("/admin/merchants", {
    params: { ...query, cursor, limit: PAGE_SIZE },
  });
  return { merchants: data.data, nextCursor: data.meta.next_cursor };
}

/** GET /admin/merchants/{id}: subscription, periods, the last 10 payments, cards and stats. */
export async function getMerchant(id: number): Promise<AdminMerchantDetail> {
  const { data } = await api.get<{ data: AdminMerchantDetail }>(`/admin/merchants/${id}`);
  return data.data;
}
