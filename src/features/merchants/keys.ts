import type { ListMerchantsQuery, MerchantStatus } from "@/lib/api/types";

/**
 * The filters sent to the API (without the cursor). The backend guide lists `DELETED` as a status filter, but the
 * generated `MerchantStatus` (openapi.yaml) does not have it: the guide wins, so it is added here (gap A07 in Notion).
 */
export type MerchantsQuery = Pick<ListMerchantsQuery, "registration_step" | "q" | "trial_ending"> & {
  status?: MerchantStatus | "DELETED";
};

export const merchantsKeys = {
  all: ["merchants"] as const,
  /** The filters are part of the key: each combination keeps its own pages. */
  list: (query: MerchantsQuery) => [...merchantsKeys.all, "list", query] as const,
  detail: (id: number) => [...merchantsKeys.all, "detail", id] as const,
};
