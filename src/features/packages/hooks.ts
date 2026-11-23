"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { merchantsKeys } from "@/features/merchants/keys";
import { paymentsKeys } from "@/features/payments/keys";
import { packagesKeys } from "./keys";
import { createPackage, listPackages, updatePackage } from "./services";

export function usePackages() {
  return useQuery({ queryKey: packagesKeys.list(), queryFn: listPackages });
}

/**
 * After a change: the packages, and the payments and merchants (they show the package name, and a merchant page
 * its limits). Runs after a failure too, so a package someone else changed shows its real state.
 */
function useRefreshPackages() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: packagesKeys.all });
    void queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
    void queryClient.invalidateQueries({ queryKey: merchantsKeys.all });
  };
}

export function useCreatePackage() {
  const refresh = useRefreshPackages();
  return useMutation({ mutationFn: createPackage, onSettled: refresh });
}

export function useUpdatePackage() {
  const refresh = useRefreshPackages();
  return useMutation({ mutationFn: updatePackage, onSettled: refresh });
}
