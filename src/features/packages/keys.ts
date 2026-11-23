export const packagesKeys = {
  all: ["packages"] as const,
  list: () => [...packagesKeys.all, "list"] as const,
};
