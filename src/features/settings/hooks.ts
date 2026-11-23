"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { overviewKeys } from "@/features/overview/keys";
import { paymentsKeys } from "@/features/payments/keys";
import { settingsKeys } from "./keys";
import {
  getAppSettings,
  getBillingSettings,
  removePaymentMethodQr,
  updateAppSettings,
  updateBillingSettings,
  updatePaymentMethod,
  uploadPaymentMethodQr,
} from "./services";

export function useBillingSettings() {
  return useQuery({ queryKey: settingsKeys.billing(), queryFn: getBillingSettings });
}

export function useAppSettings() {
  return useQuery({ queryKey: settingsKeys.app(), queryFn: getAppSettings });
}

/**
 * The review time decides which pending payments are "overdue", so the payments and the home page alerts are
 * refreshed too. Runs after a failure as well, so a value someone else changed shows.
 */
export function useUpdateBillingSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBillingSettings,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.billing() });
      void queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
      void queryClient.invalidateQueries({ queryKey: overviewKeys.all });
    },
  });
}

export function useUpdateAppSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAppSettings,
    onSettled: () => void queryClient.invalidateQueries({ queryKey: settingsKeys.app() }),
  });
}

/** The payment methods live in the billing settings, so every change refreshes them. */
function useRefreshBilling() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: settingsKeys.billing() });
}

export function useUpdatePaymentMethod() {
  const refresh = useRefreshBilling();
  return useMutation({ mutationFn: updatePaymentMethod, onSettled: refresh });
}

export function useUploadPaymentMethodQr() {
  const refresh = useRefreshBilling();
  return useMutation({ mutationFn: uploadPaymentMethodQr, onSettled: refresh });
}

export function useRemovePaymentMethodQr() {
  const refresh = useRefreshBilling();
  return useMutation({ mutationFn: removePaymentMethodQr, onSettled: refresh });
}
