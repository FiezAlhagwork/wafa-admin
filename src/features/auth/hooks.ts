"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";

/** Signs out of Clerk and drops every cached response, so nothing from this account stays in memory. */
export function useSignOut() {
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const run = async () => {
    setPending(true);
    try {
      await signOut({ redirectUrl: "/sign-in" });
      queryClient.clear();
    } finally {
      setPending(false);
    }
  };

  return { signOut: run, pending };
}
