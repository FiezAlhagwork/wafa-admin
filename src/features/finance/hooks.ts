"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { DayRange } from "./filters";
import { financeKeys, type HistoryParams } from "./keys";
import { getRevenueReport, listPaymentHistory } from "./services";

/** `enabled: false` while the custom period is backwards (nothing to ask). */
export function useRevenueReport(range: DayRange, enabled = true) {
  return useQuery({ queryKey: financeKeys.report(range), queryFn: () => getRevenueReport(range), enabled });
}

export function usePaymentHistory(params: HistoryParams, enabled = true) {
  return useInfiniteQuery({
    queryKey: financeKeys.history(params),
    queryFn: ({ pageParam }) => listPaymentHistory({ params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });
}
