export const settingsKeys = {
  all: ["settings"] as const,
  billing: () => [...settingsKeys.all, "billing"] as const,
  app: () => [...settingsKeys.all, "app"] as const,
};
