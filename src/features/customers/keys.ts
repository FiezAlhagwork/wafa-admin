export const customersKeys = {
  all: ["customers"] as const,
  /** The searched phone lives only here (in memory), never in the URL. */
  search: (phone: string) => [...customersKeys.all, "search", phone] as const,
  detail: (id: number) => [...customersKeys.all, "detail", id] as const,
  cycle: (id: number) => [...customersKeys.all, "cycle", id] as const,
};
