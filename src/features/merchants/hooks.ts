"use client";

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { merchantsKeys, type MerchantsQuery } from "./keys";
import { getMerchant, listMerchants } from "./services";

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
