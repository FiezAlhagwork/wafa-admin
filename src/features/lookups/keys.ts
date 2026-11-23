export const lookupsKeys = {
  all: ["lookups"] as const,
  businessTypes: () => [...lookupsKeys.all, "business-types"] as const,
};
