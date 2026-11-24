"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { merchantsKeys } from "@/features/merchants/keys";
import type { LookupKind } from "./kinds";
import { lookupsKeys } from "./keys";
import { createLookup, listBusinessTypes, listLookups, updateLookup } from "./services";

/** `enabled: false` for a role without `manage-lookups`: the server would answer 403. */
export function useBusinessTypes({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: lookupsKeys.businessTypes(),
    queryFn: listBusinessTypes,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useLookups(kind: LookupKind) {
  return useQuery({ queryKey: lookupsKeys.list(kind), queryFn: () => listLookups(kind) });
}

/**
 * After a change: the lists, and the merchants (a merchant page shows its type's name). Runs after a failure too, so an
 * entry someone else changed shows its real state.
 */
function useRefreshLookups() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: lookupsKeys.all });
    void queryClient.invalidateQueries({ queryKey: merchantsKeys.all });
  };
}

export function useCreateLookup() {
  const refresh = useRefreshLookups();
  return useMutation({ mutationFn: createLookup, onSettled: refresh });
}

export function useUpdateLookup() {
  const refresh = useRefreshLookups();
  return useMutation({ mutationFn: updateLookup, onSettled: refresh });
}

/**
 * The Phosphor library, loaded on first use (see phosphor.ts) and kept for the session. Not API data: the query only
 * gives the load its pending and error states, and one shared copy for every icon on the screen.
 */
export function usePhosphor() {
  return useQuery({
    queryKey: ["phosphor-library"],
    queryFn: () => import("./phosphor"),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
