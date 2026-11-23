import { api } from "@/lib/api/client";
import type { AdminPayment, PaymentRejectionReason, PaymentStatus } from "@/lib/api/types";

const PAGE_SIZE = 20;

export type PaymentsPage = { payments: AdminPayment[]; nextCursor: string | null };

/** GET /admin/payments: PENDING comes oldest first, the rest newest first. `next_cursor: null` = the end. */
export async function listPayments({
  status,
  cursor,
  limit = PAGE_SIZE,
}: {
  status: PaymentStatus;
  cursor?: string;
  /** How many the server returns (the home page asks for a few). */
  limit?: number;
}): Promise<PaymentsPage> {
  const { data } = await api.get<{ data: AdminPayment[]; meta: { next_cursor: string | null } }>("/admin/payments", {
    params: { status, cursor, limit },
  });
  return { payments: data.data, nextCursor: data.meta.next_cursor };
}

/** GET /admin/payments/{id}: also gives a fresh `proof_url` (signed, valid 30 minutes). */
export async function getPayment(id: number): Promise<AdminPayment> {
  const { data } = await api.get<{ data: AdminPayment }>(`/admin/payments/${id}`);
  return data.data;
}

/** POST /admin/payments/{id}/approve: no body. 409 PAYMENT_NOT_PENDING if someone already decided. */
export async function approvePayment(id: number): Promise<AdminPayment> {
  const { data } = await api.post<{ data: AdminPayment }>(`/admin/payments/${id}/approve`);
  return data.data;
}

/** POST /admin/payments/{id}/reject: the reason is one of four fixed values and reaches the merchant. */
export async function rejectPayment({ id, reason }: { id: number; reason: PaymentRejectionReason }): Promise<AdminPayment> {
  const { data } = await api.post<{ data: AdminPayment }>(`/admin/payments/${id}/reject`, { reason });
  return data.data;
}
