"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/lib/auth/me";
import { adminUsersKeys } from "./keys";
import { createAdminUser, deactivateAdminUser, listAdminUsers, updateAdminUser } from "./services";

/** `enabled: false` where the list is only a helper (the audit log's filter) and the role may not read it. */
export function useAdminUsers({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ queryKey: adminUsersKeys.list(), queryFn: listAdminUsers, enabled });
}

/**
 * Runs after a failure too, on purpose: if someone else changed the account first, the list must show it.
 * `me` is refreshed as well, because an admin may rename their own account.
 */
function useRefreshAdminUsers() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
    void queryClient.invalidateQueries({ queryKey: authKeys.me });
  };
}

export function useCreateAdminUser() {
  const refresh = useRefreshAdminUsers();
  return useMutation({ mutationFn: createAdminUser, onSettled: refresh });
}

export function useUpdateAdminUser() {
  const refresh = useRefreshAdminUsers();
  return useMutation({ mutationFn: updateAdminUser, onSettled: refresh });
}

export function useDeactivateAdminUser() {
  const refresh = useRefreshAdminUsers();
  return useMutation({ mutationFn: deactivateAdminUser, onSettled: refresh });
}
