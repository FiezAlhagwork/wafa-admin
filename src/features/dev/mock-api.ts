// A fake backend for the development preview (/dev/shell): swaps the adapter of the one axios instance so the real
// screens, hooks and services run unchanged, without Clerk or the real API. Never imported outside /dev.

import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { api } from "@/lib/api/client";
import { businessTypes, createMerchantStore, filterMerchantSeeds, toMerchant, toMerchantDetail } from "./mock-merchants";
import type { AdminOverview, AdminPayment, AdminUser } from "@/lib/api/types";

export type MockScenario = "super_admin" | "admin" | "reviewer" | "support" | "loading" | "error";

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();
const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

function overview(withFinance: boolean): AdminOverview {
  return {
    merchants: {
      total: 1284,
      registering: 36,
      by_status: { TRIAL: 212, ACTIVE: 903, GRACE: 41, EXPIRED: 58, SUSPENDED: 12, PENDING_DELETION: 4, DELETED: 54 },
    },
    trials_ending_this_week: {
      count: 4,
      merchants: [
        { id: 1, business_name: "مقهى الياسمين", trial_ends_at: inDays(0) },
        { id: 2, business_name: "مخبز الشام", trial_ends_at: inDays(1) },
        { id: 3, business_name: "صالون لمسة للتجميل", trial_ends_at: inDays(3) },
        { id: 4, business_name: "مطعم الفرات", trial_ends_at: inDays(6) },
      ],
    },
    alerts: {
      payments_pending: 5,
      payments_overdue: 1,
      payments_duplicate_reference: 1,
      deletion_requests_new: 3,
      merchants_pending_deletion: 0,
    },
    finance: withFinance ? { month: "2026-11", count: 86, price_usd: "1245.50", amount_syp: "16191500.00" } : null,
  };
}

// A receipt-looking picture, inline so the preview needs no network
const proofImage = (label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640">
      <rect width="480" height="640" fill="#F7F7F5"/>
      <rect x="40" y="48" width="400" height="544" rx="16" fill="#FFFFFF" stroke="#D7D9DB"/>
      <circle cx="240" cy="132" r="36" fill="#17A398"/>
      <path d="M222 132l12 12 24-26" stroke="#FFFFFF" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="240" y="216" font-family="sans-serif" font-size="22" text-anchor="middle" fill="#14213D">Transfer completed</text>
      <text x="240" y="252" font-family="sans-serif" font-size="16" text-anchor="middle" fill="#6A7283">${label}</text>
      <rect x="72" y="300" width="336" height="2" fill="#E7E8E8"/>
      <text x="72" y="344" font-family="sans-serif" font-size="14" fill="#6A7283">Amount</text>
      <text x="408" y="344" font-family="sans-serif" font-size="16" text-anchor="end" fill="#14213D">591,500 SYP</text>
      <text x="72" y="388" font-family="sans-serif" font-size="14" fill="#6A7283">Reference</text>
      <text x="408" y="388" font-family="sans-serif" font-size="16" text-anchor="end" fill="#14213D">TX-84721903</text>
    </svg>`,
  )}`;

type Seed = {
  id: number;
  name: string | null;
  email?: string | null;
  packageName: string;
  months: 1 | 3 | 12;
  usd: string;
  syp: string;
  method: AdminPayment["method"];
  reference: string | null;
  status: AdminPayment["status"];
  hours: number;
  overdue?: boolean;
  duplicate?: boolean;
  reason?: AdminPayment["rejection_reason"];
};

const seeds: Seed[] = [
  { id: 1, name: "مقهى الياسمين", email: "yasmine@example.com", packageName: "المتوسطة", months: 3, usd: "45.50", syp: "591500.00", method: "syriatel_cash", reference: "94817263", status: "PENDING", hours: 74, overdue: true },
  { id: 2, name: "مخبز الشام", email: "sham.bakery@example.com", packageName: "الأساسية", months: 1, usd: "15.00", syp: "195000.00", method: "transfer", reference: "TX-20931", status: "PENDING", hours: 20, duplicate: true },
  { id: 3, name: "صالون لمسة للتجميل", email: "lamsa@example.com", packageName: "المتقدمة", months: 12, usd: "320.00", syp: "4160000.00", method: "transfer", reference: "TX-55102", status: "PENDING", hours: 9 },
  { id: 4, name: null, packageName: "الأساسية", months: 1, usd: "15.00", syp: "195000.00", method: "syriatel_cash", reference: "77120045", status: "PENDING", hours: 6 },
  { id: 5, name: "مطعم الفرات", email: "furat@example.com", packageName: "المتوسطة", months: 1, usd: "18.00", syp: "234000.00", method: "syriatel_cash", reference: null, status: "PENDING", hours: 2 },
  { id: 6, name: "عيادة الشفاء", email: "shifa@example.com", packageName: "المتقدمة", months: 3, usd: "90.00", syp: "1170000.00", method: "transfer", reference: "TX-10002", status: "APPROVED", hours: 50 },
  { id: 7, name: "متجر النور", email: "alnoor@example.com", packageName: "الأساسية", months: 12, usd: "150.00", syp: "1950000.00", method: "syriatel_cash", reference: "55009981", status: "APPROVED", hours: 120 },
  { id: 8, name: "مكتبة الأفق", email: "ufuq@example.com", packageName: "المتوسطة", months: 1, usd: "18.00", syp: "234000.00", method: "transfer", reference: "TX-30771", status: "REJECTED", hours: 30, reason: "amount_short" },
];

const toPayment = (seed: Seed): AdminPayment => ({
  id: seed.id,
  package: { id: 1, name: seed.packageName, cards_limit: 5, weekly_campaigns_limit: 2 },
  duration_months: seed.months,
  price_usd: seed.usd,
  exchange_rate: "13000.00",
  amount_syp: seed.syp,
  method: seed.method,
  reference: seed.reference,
  proof_url: proofImage(seed.method === "syriatel_cash" ? "Syriatel Cash" : "Bank transfer"),
  status: seed.status,
  rejection_reason: seed.reason ?? null,
  created_at: hoursAgo(seed.hours),
  reviewed_at: seed.status === "PENDING" ? null : hoursAgo(seed.hours - 2),
  merchant: seed.name ? { id: seed.id, business_name: seed.name, email: seed.email ?? null, status: "TRIAL" } : null,
  overdue: seed.overdue ?? false,
  duplicate_reference: seed.duplicate ?? false,
  reviewed_by: seed.status === "PENDING" ? null : { id: 1, name: "سامر الحلبي" },
  subscription_period_id: null,
});

const adminUserSeeds: AdminUser[] = [
  { id: 1, name: "سامر الحلبي", email: "samer@example.com", role: "super_admin", is_active: true, linked: true, last_login_at: hoursAgo(1) },
  { id: 2, name: "ليلى المراجعة", email: "layla.reviewer@example.com", role: "payments_reviewer", is_active: true, linked: true, last_login_at: hoursAgo(30) },
  { id: 3, name: "كريم الدعم", email: "karim.support@example.com", role: "support", is_active: true, linked: false, last_login_at: null },
  { id: 4, name: "هالة المدير", email: "hala.admin@example.com", role: "admin", is_active: false, linked: true, last_login_at: hoursAgo(24 * 40) },
];

const PAGE_SIZE = 3; // small on purpose, so "load more" shows up in the preview
const LATENCY_MS = 350;

const respond = <T,>(config: InternalAxiosRequestConfig, data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config,
});

const failure = (config: InternalAxiosRequestConfig, status: number, code: string, details: Record<string, unknown> = {}) =>
  new AxiosError(code, String(status), config, null, {
    data: { error: { code, message: code, details } },
    status,
    statusText: "",
    headers: {},
    config,
  });

function createHandler(scenario: MockScenario): AxiosAdapter {
  // Only the roles with `view-financials` get the finance block on the home page; the others get null
  const canSeeFinance = scenario !== "admin" && scenario !== "support";
  const payments = seeds.map(toPayment);
  const adminUsers = adminUserSeeds.map((item) => ({ ...item }));
  const SELF_ID = 1;
  const byActiveThenName = (a: AdminUser, b: AdminUser) =>
    Number(b.is_active) - Number(a.is_active) || a.name.localeCompare(b.name, "ar");
  const bodyOf = <T,>(config: InternalAxiosRequestConfig): T =>
    (typeof config.data === "string" ? JSON.parse(config.data) : {}) as T;
  const merchants = createMerchantStore();
  // The roles with `manage-lookups`; the others get 403 on the business types, like the real server
  const canManageLookups = scenario === "super_admin" || scenario === "admin";
  // Merchant 105 is "suspended by someone else a moment ago" on the first try: shows the conflict path
  let conflictShown = false;

  return async (config) => {
    await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
    if (scenario === "loading") return new Promise<AxiosResponse>(() => {}); // never answers: the skeletons stay
    if (scenario === "error") throw failure(config, 500, "SERVER_ERROR");

    const url = config.url ?? "";
    const method = (config.method ?? "get").toLowerCase();

    if (url === "/admin/overview") return respond(config, { data: overview(canSeeFinance) });

    if (url === "/admin/payments" && method === "get") {
      const status = (config.params?.status ?? "PENDING") as AdminPayment["status"];
      const start = Number(config.params?.cursor ?? 0);
      const all = payments.filter((payment) => payment.status === status);
      // Respects a smaller `limit` like the real server (the home page asks for 5); pages stay small so "load more" shows
      const next = start + Math.min(Number(config.params?.limit ?? PAGE_SIZE), PAGE_SIZE);
      return respond(config, {
        data: all.slice(start, next),
        meta: { next_cursor: next < all.length ? String(next) : null },
      });
    }

    if (url === "/admin/merchants" && method === "get") {
      const params = (config.params ?? {}) as Record<string, string | undefined>;
      const start = Number(params.cursor ?? 0);
      const all = filterMerchantSeeds(merchants, params);
      const next = start + PAGE_SIZE;
      return respond(config, { data: all.slice(start, next).map(toMerchant), meta: { next_cursor: next < all.length ? String(next) : null } });
    }

    if (url === "/admin/business-types" && method === "get") {
      if (!canManageLookups) throw failure(config, 403, "FORBIDDEN");
      return respond(config, { data: businessTypes });
    }

    const merchantRoute = /^\/admin\/merchants\/(\d+)(?:\/(suspend|reactivate|trial-extension|cover))?$/.exec(url);
    if (merchantRoute) {
      const seed = merchants.find((item) => item.id === Number(merchantRoute[1]));
      if (!seed) throw failure(config, 404, "NOT_FOUND");
      const route = merchantRoute[2];
      if (!route && method === "get") return respond(config, { data: toMerchantDetail(seed) });

      // Every action: a reason of 3–255 characters, and the other fields by the same rules as the server
      const body = bodyOf<{ reason?: string; business_name?: string; business_type_id?: number; days?: number }>(config);
      const fields: Record<string, string[]> = {};
      const reason = body.reason?.trim() ?? "";
      if (reason.length < 3) fields.reason = [reason ? "min" : "required"];
      if (reason.length > 255) fields.reason = ["max"];
      if (body.business_name !== undefined) {
        const name = body.business_name.trim();
        if (name.length < 2) fields.business_name = ["min"];
        if (name.length > 80) fields.business_name = ["max"];
      }
      if (
        body.business_type_id !== undefined &&
        !businessTypes.some((type) => type.id === body.business_type_id && type.is_active)
      ) {
        fields.business_type_id = ["exists"];
      }
      const days = Number(body.days);
      if (route === "trial-extension" && !(Number.isInteger(days) && days >= 1 && days <= 90)) {
        fields.days = [days > 90 ? "max" : "min"];
      }
      if (Object.keys(fields).length > 0) throw failure(config, 422, "VALIDATION_FAILED", { fields });

      const status: string | null = seed.status;
      const conflict = () => failure(config, 409, "MERCHANT_STATUS_CONFLICT", { status });

      if (route === "suspend" && method === "post") {
        if (status === "SUSPENDED" || status === "PENDING_DELETION" || status === "DELETED") throw conflict();
        seed.statusBeforeSuspension = seed.status;
        seed.status = "SUSPENDED";
        seed.suspensionReason = reason;
        seed.suspendedAt = new Date().toISOString();
        if (seed.id === 105 && !conflictShown) {
          conflictShown = true;
          seed.suspensionReason = "قرار مدير آخر: شكاوى متكررة من الزبائن";
          throw failure(config, 409, "MERCHANT_STATUS_CONFLICT", { status: "SUSPENDED" });
        }
        return respond(config, { data: toMerchantDetail(seed).subscription });
      }

      if (route === "reactivate" && method === "post") {
        if (status !== "SUSPENDED") throw conflict();
        // Back to what the dates say now: an ended subscription comes back EXPIRED
        seed.status =
          seed.endsInDays !== null && seed.endsInDays < 0 ? "EXPIRED" : (seed.statusBeforeSuspension ?? "ACTIVE");
        seed.suspensionReason = undefined;
        seed.suspendedAt = undefined;
        seed.statusBeforeSuspension = undefined;
        return respond(config, { data: toMerchantDetail(seed).subscription });
      }

      if (route === "trial-extension" && method === "post") {
        if (status !== "TRIAL" && status !== "EXPIRED") {
          throw failure(config, 422, "TRIAL_NOT_EXTENDABLE", { reason: "status" });
        }
        if (status === "EXPIRED" && !seed.neverPaid) throw failure(config, 422, "TRIAL_NOT_EXTENDABLE", { reason: "paid" });
        // After the trial end, or after today if it ended (so an expired trial is a trial again)
        seed.endsInDays = Math.max(seed.endsInDays ?? 0, 0) + days;
        seed.status = "TRIAL";
        return respond(config, { data: toMerchantDetail(seed).subscription });
      }

      if (route === "cover" && method === "delete") {
        seed.hasCover = false;
        return respond(config, { data: toMerchantDetail(seed) });
      }

      if (!route && method === "patch") {
        if (body.business_name !== undefined) seed.name = body.business_name.trim();
        const type = businessTypes.find((item) => item.id === body.business_type_id);
        if (type) seed.type = type.name;
        return respond(config, { data: toMerchantDetail(seed) });
      }
    }

    const cardRoute = /^\/admin\/cards\/(\d+)\/suspend$/.exec(url);
    if (cardRoute && method === "post") {
      const cardId = Number(cardRoute[1]);
      const seed = merchants.find((item) => item.id === Math.floor(cardId / 10));
      const card = seed ? toMerchantDetail(seed).cards.find((item) => item.id === cardId) : undefined;
      if (!seed || !card) throw failure(config, 404, "NOT_FOUND");
      const reason = bodyOf<{ reason?: string }>(config).reason?.trim() ?? "";
      if (reason.length < 3 || reason.length > 255) {
        throw failure(config, 422, "VALIDATION_FAILED", { fields: { reason: [reason.length > 255 ? "max" : "min"] } });
      }
      // Already paused: nothing happens, like the server
      if (!seed.suspendedCardIds?.includes(cardId)) seed.suspendedCardIds = [...(seed.suspendedCardIds ?? []), cardId];
      return respond(config, {
        data: { id: card.id, merchant_id: seed.id, name: card.name, status: "suspended", suspended_at: new Date().toISOString() },
      });
    }

    if (url === "/admin/admin-users" && method === "get") return respond(config, { data: [...adminUsers].sort(byActiveThenName) });

    if (url === "/admin/admin-users" && method === "post") {
      const body = bodyOf<{ name: string; email: string; role: AdminUser["role"] }>(config);
      if (adminUsers.some((item) => item.email.toLowerCase() === body.email.toLowerCase())) {
        throw failure(config, 422, "VALIDATION_FAILED", { fields: { email: ["taken"] } });
      }
      const created: AdminUser = { id: adminUsers.length + 1, ...body, is_active: true, linked: false, last_login_at: null };
      adminUsers.push(created);
      return { ...respond(config, { data: created }), status: 201, statusText: "Created" };
    }

    const adminUserRoute = /^\/admin\/admin-users\/(\d+)$/.exec(url);
    if (adminUserRoute) {
      const target = adminUsers.find((item) => item.id === Number(adminUserRoute[1]));
      if (!target) throw failure(config, 404, "NOT_FOUND");
      const own = failure(config, 422, "VALIDATION_FAILED", { fields: { admin_user: ["invalid"] } });

      if (method === "delete") {
        if (target.id === SELF_ID) throw own;
        target.is_active = false;
        return respond(config, { data: target });
      }

      const body = bodyOf<Partial<Pick<AdminUser, "name" | "email" | "role" | "is_active">>>(config);
      if (target.id === SELF_ID && ((body.role && body.role !== target.role) || body.is_active === false)) throw own;
      if (body.email !== undefined && target.linked) throw failure(config, 422, "VALIDATION_FAILED", { fields: { email: ["prohibits"] } });
      Object.assign(target, body);
      return respond(config, { data: target });
    }

    const detail = /^\/admin\/payments\/(\d+)(?:\/(approve|reject))?$/.exec(url);
    const payment = detail ? payments.find((item) => item.id === Number(detail[1])) : undefined;
    if (!detail || !payment) throw failure(config, 404, "NOT_FOUND");

    if (!detail[2]) return respond(config, { data: payment });

    if (payment.status !== "PENDING") throw failure(config, 409, "PAYMENT_NOT_PENDING", { status: payment.status });

    // Payment 3 is "approved by someone else a moment ago": shows the conflict path
    if (payment.id === 3) {
      payment.status = "APPROVED";
      payment.reviewed_at = new Date().toISOString();
      throw failure(config, 409, "PAYMENT_NOT_PENDING", { status: "APPROVED" });
    }

    const body = bodyOf<{ reason?: AdminPayment["rejection_reason"] }>(config);
    payment.status = detail[2] === "approve" ? "APPROVED" : "REJECTED";
    payment.rejection_reason = detail[2] === "reject" ? (body.reason ?? null) : null;
    payment.reviewed_at = new Date().toISOString();
    payment.reviewed_by = { id: 1, name: "سامر الحلبي" };
    return respond(config, { data: payment });
  };
}

/**
 * Plug the fake backend into the shared axios instance. `activate` is idempotent and `deactivate` puts the real adapter
 * back (leaving /dev/shell must not leave the dashboard talking to fixtures).
 */
// The real adapter, taken once before any preview swaps it
const realAdapter = api.defaults.adapter;

export function createMockApi(scenario: MockScenario) {
  const handler = createHandler(scenario);

  return {
    activate() {
      api.defaults.adapter = handler;
    },
    // Only undoes its own swap: when the scenario changes, the new preview activates before the old one is cleaned up,
    // and the old cleanup must not knock the new fake backend out
    deactivate() {
      if (api.defaults.adapter === handler) api.defaults.adapter = realAdapter;
    },
  };
}
