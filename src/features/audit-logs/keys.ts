import type { AuditFilters } from "./filters";

export const auditKeys = {
  all: ["audit-logs"] as const,
  /** The filters are part of the key: each combination keeps its own pages. */
  list: (filters: AuditFilters) => [...auditKeys.all, "list", filters] as const,
};
