import type { LookupKind } from "./kinds";

export const lookupsKeys = {
  all: ["lookups"] as const,
  list: (kind: LookupKind) => [...lookupsKeys.all, kind] as const,
  businessTypes: () => lookupsKeys.list("types"),
  icons: () => lookupsKeys.list("icons"),
};
