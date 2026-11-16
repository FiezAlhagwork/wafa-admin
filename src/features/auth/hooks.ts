"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";

/** Signs out of Clerk and drops every cached response, so nothing from this account stays in memory. */
export function useSignOut() {
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const run = async () => {
    setPending(true);
    try {
      // No redirectUrl: we navigate ourselves, so the cache is always cleared first. Once signed out the `me`
      // query is disabled (AdminProvider), so clearing does not trigger a refetch.
      await signOut();
      queryClient.clear();
      router.replace("/sign-in");
    } finally {
      setPending(false);
    }
  };

  return { signOut: run, pending };
}
