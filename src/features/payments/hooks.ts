"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { overviewKeys } from "@/features/overview/keys";
import type { AdminPayment, PaymentStatus } from "@/lib/api/types";
import { paymentsKeys } from "./keys";
import { approvePayment, getPayment, listPayments, rejectPayment } from "./services";

export function usePayments(status: PaymentStatus) {
  return useInfiniteQuery({
    queryKey: paymentsKeys.list(status),
    queryFn: ({ pageParam }) => listPayments({ status, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

/**
 * One payment, always re-fetched when the review dialog opens: `proof_url` is signed and valid for 30 minutes,
 * so a cached one may have expired. `placeholder` (the row from the list) shows the facts while it loads.
 */
export function usePayment(id: number, placeholder?: AdminPayment) {
  return useQuery({
    queryKey: paymentsKeys.detail(id),
    queryFn: () => getPayment(id),
    staleTime: 0,
    refetchOnMount: "always",
    placeholderData: placeholder,
  });
}

/**
 * After approving or rejecting: every payments list and detail, and the home page (its alerts and counts change).
 * Also runs after a failure on purpose: PAYMENT_NOT_PENDING means someone else decided first, so we refetch the item.
 */
function useRefreshAfterReview() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
    void queryClient.invalidateQueries({ queryKey: overviewKeys.all });
  };
}

export function useApprovePayment() {
  const refresh = useRefreshAfterReview();
  return useMutation({ mutationFn: approvePayment, onSettled: refresh });
}

export function useRejectPayment() {
  const refresh = useRefreshAfterReview();
  return useMutation({ mutationFn: rejectPayment, onSettled: refresh });
}
