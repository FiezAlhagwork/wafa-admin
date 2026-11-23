import type { MerchantStatus } from "@/lib/api/types";
import type { MerchantsQuery } from "./keys";

/** `""` = every merchant. `NO_PACKAGE` and `NO_PIN` are merchants still registering: they have no status, only a step. */
export type StatusFilter = "" | MerchantStatus | "DELETED" | "NO_PACKAGE" | "NO_PIN";

export type MerchantFilters = {
  q: string;
  status: StatusFilter;
  trialEnding: boolean;
};

export const emptyFilters: MerchantFilters = { q: "", status: "", trialEnding: false };

const statuses = new Set<string>([
  "TRIAL",
  "ACTIVE",
  "GRACE",
  "EXPIRED",
  "SUSPENDED",
  "PENDING_DELETION",
  "DELETED",
  "NO_PACKAGE",
  "NO_PIN",
]);

/** The filters live in the URL (`?q=&status=&trial_ending=week`), so a view can be saved and shared. */
export function parseFilters(params: URLSearchParams): MerchantFilters {
  const status = params.get("status") ?? "";
  return {
    q: params.get("q") ?? "",
    status: statuses.has(status) ? (status as StatusFilter) : "",
    trialEnding: params.get("trial_ending") === "week",
  };
}

export function filtersToSearch({ q, status, trialEnding }: MerchantFilters): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (trialEnding) params.set("trial_ending", "week");
  const search = params.toString();
  return search ? `?${search}` : "";
}

/** `q` must be 2–100 characters, so anything shorter is not sent at all (the server would answer 422). */
export function toQuery({ q, status, trialEnding }: MerchantFilters): MerchantsQuery {
  const query: MerchantsQuery = {};
  const text = q.trim();
  if (text.length >= 2) query.q = text.slice(0, 100);
  if (status === "NO_PACKAGE") query.registration_step = "package";
  else if (status === "NO_PIN") query.registration_step = "pin";
  else if (status) query.status = status;
  if (trialEnding) query.trial_ending = "week";
  return query;
}
