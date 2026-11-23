import type { PaymentStatus } from "@/lib/api/types";

export const paymentsKeys = {
  all: ["payments"] as const,
  /** The filter is part of the key: each status tab keeps its own pages. */
  list: (status: PaymentStatus) => [...paymentsKeys.all, "list", { status }] as const,
  /** A short first page (the home page's preview): its own key, so it never mixes with the tab's pages. */
  preview: (status: PaymentStatus, limit: number) => [...paymentsKeys.all, "preview", { status, limit }] as const,
  detail: (id: number) => [...paymentsKeys.all, "detail", id] as const,
};
