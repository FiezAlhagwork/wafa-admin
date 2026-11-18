"use client";

import { useQuery } from "@tanstack/react-query";
import { lookupsKeys } from "./keys";
import { listBusinessTypes } from "./services";

/** `enabled: false` for a role without `manage-lookups`: the server would answer 403. */
export function useBusinessTypes({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: lookupsKeys.businessTypes(),
    queryFn: listBusinessTypes,
    enabled,
    staleTime: 5 * 60_000,
  });
}
