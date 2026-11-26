import type { ListMerchantsQuery, MerchantStatus } from "@/lib/api/types";

/**
 * The filters sent to the API (without the cursor). A merchant's `status` may now be `DELETED`, but the `status` filter
 * of `GET /admin/merchants` still lists only `MerchantStatus` in openapi.yaml, while the guide accepts `DELETED`: the
 * guide wins, so it is added here (what is left of gap A07 in Notion).
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
