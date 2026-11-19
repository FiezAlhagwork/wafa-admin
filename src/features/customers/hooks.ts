"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { merchantsKeys } from "@/features/merchants/keys";
import { overviewKeys } from "@/features/overview/keys";
import type { AdminCustomer } from "@/lib/api/types";
import { customersKeys } from "./keys";
import {
  cancelStamp,
  findCustomer,
  getCardCycle,
  getCustomer,
  revealCustomerPhone,
  updateCustomerBirthdate,
} from "./services";

/** Runs only for a searched phone (`null` before the first search): no request while typing. */
export function useCustomerSearch(phone: string | null) {
  return useQuery({
    queryKey: customersKeys.search(phone ?? ""),
    queryFn: () => findCustomer(phone ?? ""),
    enabled: phone !== null,
  });
}

export function useCustomer(id: number) {
  return useQuery({ queryKey: customersKeys.detail(id), queryFn: () => getCustomer(id) });
}

/** `null` while no cycle is open. */
export function useCardCycle(id: number | null) {
  return useQuery({
    queryKey: customersKeys.cycle(id ?? 0),
    queryFn: () => getCardCycle(id ?? 0),
    enabled: id !== null,
  });
}

export function useUpdateCustomerBirthdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCustomerBirthdate,
    // The server answers with the whole customer: shown at once, then everything about customers is refetched
    onSuccess: (customer: AdminCustomer) => queryClient.setQueryData(customersKeys.detail(customer.id), customer),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: customersKeys.all }),
  });
}

/**
 * The full number lives only in the component that asked for it. `gcTime: 0` drops the mutation (and the number in
 * its result) from TanStack's cache as soon as that component is gone, so leaving the page forgets it.
 */
export function useRevealCustomerPhone() {
  return useMutation({ mutationFn: revealCustomerPhone, gcTime: 0 });
}

/**
 * After cancelling a stamp: the cycle and the customer, the merchant's stamp counts, and the home page. Also after a
 * failure: REWARD_ALREADY_REDEEMED means the gift was given out meanwhile, so the cycle is refetched.
 */
export function useCancelStamp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelStamp,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.all });
      void queryClient.invalidateQueries({ queryKey: merchantsKeys.all });
      void queryClient.invalidateQueries({ queryKey: overviewKeys.all });
    },
  });
}
