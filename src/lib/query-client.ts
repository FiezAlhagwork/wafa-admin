import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui";
import { getErrorMessage, isApiError } from "@/lib/api/errors";

/**
 * Failures every screen shares, shown once here instead of in each hook:
 * 403 (the role doesn't allow it) and 429 (rate limited). Same toast id, so repeats update instead of stacking.
 * Everything else is shown where it happened (field errors, ErrorState...).
 * 401 is not redirected here: AdminProvider shows it (a redirect would loop when the origin is missing from
 * the backend's CLERK_AUTHORIZED_PARTIES).
 */
function showSharedError(error: unknown) {
  if (!isApiError(error)) return;
  if (error.code === "FORBIDDEN") toast.error(getErrorMessage(error), { id: "forbidden" });
  if (error.code === "RATE_LIMITED") toast.warning(getErrorMessage(error), { id: "rate-limited" });
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // A query that handles its own errors (the first /admin/auth/me call shows the "no access" screen)
        if (query.meta?.skipSharedError === true) return;
        showSharedError(error);
      },
    }),
    mutationCache: new MutationCache({ onError: showSharedError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // 4xx won't change on retry (forbidden, not found, validation); retry the rest once.
        retry: (failureCount, error) => {
          if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
          return failureCount < 1;
        },
      },
      mutations: { retry: false },
    },
  });
}
