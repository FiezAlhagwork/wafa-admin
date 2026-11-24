import { api } from "@/lib/api/client";
import type {
  AdminMerchant,
  AdminMerchantDetail,
  ExtendTrialBody,
  MerchantLink,
  UpdateMerchantIdentityBody,
} from "@/lib/api/types";
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

// The actions. Each takes a reason that the server writes to the audit log.

type WithId<T> = { id: number } & T;
type Reason = { reason: string };

/** POST /admin/merchants/{id}/suspend: no stamps, new customers or campaigns; giving out gifts keeps working. */
export async function suspendMerchant({ id, reason }: WithId<Reason>): Promise<void> {
  await api.post(`/admin/merchants/${id}/suspend`, { reason });
}

/** POST /admin/merchants/{id}/reactivate: from SUSPENDED only; the status goes back to what the dates say now. */
export async function reactivateMerchant({ id, reason }: WithId<Reason>): Promise<void> {
  await api.post(`/admin/merchants/${id}/reactivate`, { reason });
}

/** PATCH /admin/merchants/{id}: the name and/or the type. Send only what changed. */
export async function updateMerchantIdentity({
  id,
  ...body
}: WithId<UpdateMerchantIdentityBody>): Promise<AdminMerchantDetail> {
  const { data } = await api.patch<{ data: AdminMerchantDetail }>(`/admin/merchants/${id}`, body);
  return data.data;
}

/** POST /admin/merchants/{id}/trial-extension: for a merchant who never paid. The days go after the trial end, or after today if it ended. */
export async function extendTrial({ id, ...body }: WithId<ExtendTrialBody>): Promise<void> {
  await api.post(`/admin/merchants/${id}/trial-extension`, body);
}

/** DELETE /admin/merchants/{id}/cover: an unsuitable cover. The shop can upload another one. */
export async function removeMerchantCover({ id, reason }: WithId<Reason>): Promise<AdminMerchantDetail> {
  const { data } = await api.delete<{ data: AdminMerchantDetail }>(`/admin/merchants/${id}/cover`, { data: { reason } });
  return data.data;
}

/** DELETE /admin/merchants/{id}/links/{link}: an unsuitable or fake link, gone from the shop page. */
export async function removeMerchantLink({
  id,
  link,
  reason,
}: WithId<Reason> & { link: MerchantLink }): Promise<AdminMerchantDetail> {
  const { data } = await api.delete<{ data: AdminMerchantDetail }>(`/admin/merchants/${id}/links/${link}`, {
    data: { reason },
  });
  return data.data;
}

/** POST /admin/cards/{id}/suspend: unsuitable content. Gifts already earned are still given out. */
export async function suspendCard({ id, reason }: WithId<Reason>): Promise<void> {
  await api.post(`/admin/cards/${id}/suspend`, { reason });
}
