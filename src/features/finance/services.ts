import { api } from "@/lib/api/client";
import type { AdminPayment, RevenueReport } from "@/lib/api/types";
import type { DayRange } from "./filters";
import type { HistoryParams } from "./keys";

const PAGE_SIZE = 20;

export type PaymentHistoryPage = { payments: AdminPayment[]; nextCursor: string | null };

/**
 * GET /admin/finance/report: the approved payments between two days (by approval day, Damascus time). Without days the
 * server counts from the first of this month to today. The amounts are the ones stored with each payment.
 */
export async function getRevenueReport(range: DayRange): Promise<RevenueReport> {
  const { data } = await api.get<{ data: RevenueReport }>("/admin/finance/report", { params: range });
  return data.data;
}

/** GET /admin/finance/payments: every payment, newest first, read only. The days are upload days. */
export async function listPaymentHistory({
  params,
  cursor,
}: {
  params: HistoryParams;
  cursor?: string;
}): Promise<PaymentHistoryPage> {
  const { data } = await api.get<{ data: AdminPayment[]; meta: { next_cursor: string | null } }>("/admin/finance/payments", {
    params: {
      status: params.status || undefined,
      method: params.method || undefined,
      merchant_id: params.merchantId ?? undefined,
      from: params.from,
      to: params.to,
      cursor,
      limit: PAGE_SIZE,
    },
  });
  return { payments: data.data, nextCursor: data.meta.next_cursor };
}
