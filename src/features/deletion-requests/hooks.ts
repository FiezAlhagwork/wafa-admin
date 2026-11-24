"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersKeys } from "@/features/customers/keys";
import { merchantsKeys } from "@/features/merchants/keys";
import { overviewKeys } from "@/features/overview/keys";
import type { DeletionFilters } from "./filters";
import { deletionKeys } from "./keys";
import { cancelMerchantDeletion, deleteCustomer, listDeletionRequests, scheduleMerchantDeletion } from "./services";

export function useDeletionRequests(filters: DeletionFilters) {
  return useInfiniteQuery({
    queryKey: deletionKeys.list(filters),
    queryFn: ({ pageParam }) => listDeletionRequests({ filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

/**
 * After any of them: the requests, the merchant or customer it touched, and the home page counts (new requests,
 * merchants waiting for deletion). Runs after a failure too: a 409 means someone else changed it first.
 */
function useRefreshAfterDeletion() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: deletionKeys.all });
    void queryClient.invalidateQueries({ queryKey: merchantsKeys.all });
    void queryClient.invalidateQueries({ queryKey: customersKeys.all });
    void queryClient.invalidateQueries({ queryKey: overviewKeys.all });
  };
}

export function useScheduleMerchantDeletion() {
  const refresh = useRefreshAfterDeletion();
  return useMutation({ mutationFn: scheduleMerchantDeletion, onSettled: refresh });
}

export function useCancelMerchantDeletion() {
  const refresh = useRefreshAfterDeletion();
  return useMutation({ mutationFn: cancelMerchantDeletion, onSettled: refresh });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const refresh = useRefreshAfterDeletion();
  return useMutation({
    mutationFn: deleteCustomer,
    // The customer is gone: drop the page's data instead of refetching a record that no longer exists
    onSuccess: (_, { id }) => queryClient.removeQueries({ queryKey: customersKeys.detail(id) }),
    onSettled: refresh,
  });
}
