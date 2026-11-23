"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui";

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
    } catch {
      // The session is still there: say so instead of leaving an unhandled rejection
      toast.error("تعذّر تسجيل الخروج، تحقّق من اتصالك وحاول مرة أخرى");
    } finally {
      setPending(false);
    }
  };

  return { signOut: run, pending };
}
