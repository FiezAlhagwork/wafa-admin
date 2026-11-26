import type { DeletionFilters } from "./filters";

export const deletionKeys = {
  all: ["deletion-requests"] as const,
  /** The filters are part of the key: each combination keeps its own pages. */
  list: (filters: DeletionFilters) => [...deletionKeys.all, "list", filters] as const,
};
