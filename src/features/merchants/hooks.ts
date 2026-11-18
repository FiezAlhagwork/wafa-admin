"use client";

import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { overviewKeys } from "@/features/overview/keys";
import type { AdminMerchantDetail } from "@/lib/api/types";
import { merchantsKeys, type MerchantsQuery } from "./keys";
import {
  extendTrial,
  getMerchant,
  listMerchants,
  reactivateMerchant,
  removeMerchantCover,
  suspendCard,
  suspendMerchant,
  updateMerchantIdentity,
} from "./services";

export function useMerchants(query: MerchantsQuery) {
  return useInfiniteQuery({
    queryKey: merchantsKeys.list(query),
    queryFn: ({ pageParam }) => listMerchants({ query, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // While a new filter loads, the previous list stays (dimmed by the screen) instead of flashing skeletons
    placeholderData: keepPreviousData,
  });
}

export function useMerchant(id: number) {
  return useQuery({ queryKey: merchantsKeys.detail(id), queryFn: () => getMerchant(id) });
}

/**
 * After any merchant action: every merchants list and detail, and the home page (its counts and alerts change).
 * Also runs after a failure on purpose: MERCHANT_STATUS_CONFLICT / TRIAL_NOT_EXTENDABLE mean someone else changed
 * the merchant first, so the page is refetched.
 */
function useRefreshAfterAction() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: merchantsKeys.all });
    void queryClient.invalidateQueries({ queryKey: overviewKeys.all });
  };
}

/** For the endpoints that answer with the whole merchant: the page shows it at once, before the refetch. */
function useShowReturnedMerchant() {
  const queryClient = useQueryClient();
  return (merchant: AdminMerchantDetail) => queryClient.setQueryData(merchantsKeys.detail(merchant.id), merchant);
}

export function useSuspendMerchant() {
  const refresh = useRefreshAfterAction();
  return useMutation({ mutationFn: suspendMerchant, onSettled: refresh });
}

export function useReactivateMerchant() {
  const refresh = useRefreshAfterAction();
  return useMutation({ mutationFn: reactivateMerchant, onSettled: refresh });
}

export function useUpdateMerchantIdentity() {
  const refresh = useRefreshAfterAction();
  const show = useShowReturnedMerchant();
  return useMutation({ mutationFn: updateMerchantIdentity, onSuccess: show, onSettled: refresh });
}

export function useExtendTrial() {
  const refresh = useRefreshAfterAction();
  return useMutation({ mutationFn: extendTrial, onSettled: refresh });
}

export function useRemoveMerchantCover() {
  const refresh = useRefreshAfterAction();
  const show = useShowReturnedMerchant();
  return useMutation({ mutationFn: removeMerchantCover, onSuccess: show, onSettled: refresh });
}

export function useSuspendCard() {
  const refresh = useRefreshAfterAction();
  return useMutation({ mutationFn: suspendCard, onSettled: refresh });
}
