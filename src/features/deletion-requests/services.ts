import { api } from "@/lib/api/client";
import type { DeletionRequest, DeletionRequestInput } from "@/lib/api/types";
import type { DeletionFilters } from "./filters";

const PAGE_SIZE = 20;

export type DeletionRequestsPage = { requests: DeletionRequest[]; nextCursor: string | null };

/** GET /admin/deletion-requests: newest first, by cursor. Both filters are optional ("all" sends nothing). */
export async function listDeletionRequests({
  filters,
  cursor,
}: {
  filters: DeletionFilters;
  cursor?: string;
}): Promise<DeletionRequestsPage> {
  const { data } = await api.get<{ data: DeletionRequest[]; meta: { next_cursor: string | null } }>(
    "/admin/deletion-requests",
    {
      params: {
        status: filters.status || undefined,
        subject_type: filters.subject || undefined,
        cursor,
        limit: PAGE_SIZE,
      },
    },
  );
  return { requests: data.data, nextCursor: data.meta.next_cursor };
}

/**
 * POST /admin/merchants/{id}/deletion: the merchant asked to leave. They become PENDING_DELETION for 30 days (gifts
 * already earned can still be handed out), then their personal data is wiped.
 */
export async function scheduleMerchantDeletion({
  id,
  ...body
}: DeletionRequestInput & { id: number }): Promise<DeletionRequest> {
  const { data } = await api.post<{ data: DeletionRequest }>(`/admin/merchants/${id}/deletion`, body);
  return data.data;
}

/** POST /admin/deletion-requests/{id}/cancel: only while the merchant is still in the waiting period. */
export async function cancelMerchantDeletion(id: number): Promise<DeletionRequest> {
  const { data } = await api.post<{ data: DeletionRequest }>(`/admin/deletion-requests/${id}/cancel`);
  return data.data;
}

/** POST /admin/customers/{id}/deletion: done at once, the same as deleting from the app. */
export async function deleteCustomer({ id, ...body }: DeletionRequestInput & { id: number }): Promise<DeletionRequest> {
  const { data } = await api.post<{ data: DeletionRequest }>(`/admin/customers/${id}/deletion`, body);
  return data.data;
}
