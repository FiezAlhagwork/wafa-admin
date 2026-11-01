"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { SignOut } from "@phosphor-icons/react";
import { Button, ErrorState, Spinner } from "@/components/ui";
import { FullScreenState } from "@/features/auth/components/FullScreenState";
import { useSignOut } from "@/features/auth/hooks";
import { NoAccessScreen } from "@/features/auth/screens/NoAccessScreen";
import { setTokenGetter } from "@/lib/api/client";
import { isApiError } from "@/lib/api/errors";
import { authKeys, getMe, type Me } from "./me";

const AdminContext = createContext<Me | null>(null);

/** The signed-in admin and their permissions. Only usable under /admin (inside AdminProvider). */
export function useAdmin() {
  const admin = useContext(AdminContext);
  if (!admin) throw new Error("useAdmin must be used inside <AdminProvider>");
  return admin;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  // Registered during render on purpose: it is an idempotent write, and it must be in place before the
  // first request below fires (an effect could run after the query starts and send it without a token).
  setTokenGetter(getToken);

  const me = useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60_000,
  });

  if (me.isSuccess) return <AdminContext value={me.data}>{children}</AdminContext>;

  if (me.isError) {
    if (isApiError(me.error) && me.error.code === "FORBIDDEN") return <NoAccessScreen />;
    return <MeErrorScreen onRetry={() => me.refetch()} retrying={me.isFetching} />;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <Spinner size="lg" label="جارٍ التحميل" className="text-brand" />
    </main>
  );
}

/**
 * Any other failure (401, network, 5xx). A 401 is shown, not redirected: with a valid Clerk session it usually
 * means this origin is missing from the backend's CLERK_AUTHORIZED_PARTIES, and a redirect would loop.
 */
function MeErrorScreen({ onRetry, retrying }: { onRetry: () => void; retrying: boolean }) {
  const { signOut, pending } = useSignOut();

  return (
    <FullScreenState>
      <ErrorState
        title="تعذّر التحقق من حسابك"
        description="تحقّق من اتصالك ثم أعد المحاولة. إذا استمرت المشكلة، سجّل الخروج وادخل من جديد."
        onRetry={onRetry}
        retrying={retrying}
      />
      <div className="flex justify-center border-t border-border p-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<SignOut className="size-4 rtl:-scale-x-100" />}
          loading={pending}
          onClick={signOut}
        >
          تسجيل الخروج
        </Button>
      </div>
    </FullScreenState>
  );
}
