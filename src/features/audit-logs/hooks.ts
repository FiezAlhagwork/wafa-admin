"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { AuditFilters } from "./filters";
import { auditKeys } from "./keys";
import { listAuditLogs } from "./services";

/** Read only: nothing in the dashboard writes to it, every other action adds to it on the server. */
export function useAuditLogs(filters: AuditFilters) {
  return useInfiniteQuery({
    queryKey: auditKeys.list(filters),
    queryFn: ({ pageParam }) => listAuditLogs({ filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // Other admins keep adding to it: coming back to the screen shows the newest
    staleTime: 0,
  });
}
