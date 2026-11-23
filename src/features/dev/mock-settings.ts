// Platform settings for the development preview (/dev/shell). Never imported outside /dev.
// Each preview gets its own copy (`createSettingsStore`), with the server's rules (guide §5.10 and §5.27).

import type {
  AdminPaymentAccount,
  AppSettings,
  BillingSettings,
  PaymentMethod,
  UpdateAppSettingsBody,
  UpdateBillingSettingsBody,
  UpdatePaymentMethodBody,
} from "@/lib/api/types";

type Fields = Record<string, string[]>;
type Result<T> = { ok: true; data: T } | { ok: false; fields: Fields };
export type MethodResult = Result<AdminPaymentAccount> | { ok: false; notFound: true };

const QR_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ranges: Record<string, [number, number]> = {
  payment_review_sla_hours: [1, 168],
  trial_days: [1, 90],
  grace_days: [0, 30],
  stamp_interval_minutes: [0, 1440],
  card_stamps_min: [1, 50],
  card_stamps_max: [1, 50],
  qr_period_seconds: [15, 600],
  campaign_title_max: [10, 255],
  campaign_body_max: [20, 2000],
  pin_unlock_hours: [1, 72],
};
const urlFields = [
  "merchant_app_download_url",
  "privacy_policy_url",
  "customer_terms_url",
  "merchant_terms_url",
  "support_url",
];

function checkCommon(body: Record<string, unknown>, fields: Fields) {
  for (const [name, value] of Object.entries(body)) {
    const range = ranges[name];
    if (range && typeof value === "number") {
      if (!Number.isInteger(value) || value < range[0]) fields[name] = ["min"];
      else if (value > range[1]) fields[name] = ["max"];
    }
    if (urlFields.includes(name) && typeof value === "string" && (!value.startsWith("https://") || value.length > 500)) {
      fields[name] = ["url"];
    }
  }
}

export function createSettingsStore() {
  const billing: BillingSettings = {
    exchange_rate_syp: "13000.00",
    payment_review_sla_hours: 24,
    trial_days: 14,
    grace_days: 3,
    // Shown by the payment methods card (next step); the GET carries them, like the server
    payment_methods: [
      {
        key: "sham_cash",
        name: "شام كاش",
        is_active: true,
        sort_order: 1,
        recipient_name: null,
        account: "SC-7Q4M-21",
        qr_url: null,
        note: null,
      },
      {
        // Not set up yet: no recipient number, so it cannot be switched on until one is added
        key: "haram",
        name: "الهرم",
        is_active: false,
        sort_order: 2,
        recipient_name: "شركة وفاء للحلول الرقمية",
        account: null,
        qr_url: null,
        note: "اكتب رقم الحوالة في مرجع الدفعة.",
      },
    ],
  };
  const app: AppSettings = {
    stamp_interval_minutes: 60,
    card_stamps_min: 3,
    card_stamps_max: 10,
    qr_period_seconds: 60,
    campaign_title_max: 60,
    campaign_body_max: 300,
    merchant_min_app_version: "1.0.0",
    merchant_app_download_url: "https://wafacard.app/download/wafa-merchant.apk",
    privacy_policy_url: "https://wafacard.app/privacy",
    customer_terms_url: "https://wafacard.app/terms/customers",
    merchant_terms_url: "https://wafacard.app/terms/merchants",
    support_url: "https://wa.me/963933000111",
    pin_unlock_hours: 12,
  };

  const methodOf = (key: PaymentMethod) => billing.payment_methods?.find((item) => item.key === key);

  return {
    billing: () => billing,

    /** PATCH payment-methods/{method}: lengths, the order range, and no active method without an account. */
    updateMethod(key: PaymentMethod, body: UpdatePaymentMethodBody): MethodResult {
      const method = methodOf(key);
      if (!method) return { ok: false, notFound: true };
      const fields: Fields = {};
      for (const [name, max] of [["recipient_name", 100], ["account", 100], ["note", 500]] as const) {
        if ((body[name]?.length ?? 0) > max) fields[name] = ["max"];
      }
      if (body.sort_order !== undefined && (body.sort_order < 0 || body.sort_order > 1000)) fields.sort_order = ["max"];
      const account = body.account !== undefined ? body.account : method.account;
      const active = body.is_active ?? method.is_active;
      if (active && !account) fields.account = ["invalid"];
      if (Object.keys(fields).length > 0) return { ok: false, fields };
      Object.assign(method, body);
      return { ok: true, data: method };
    },

    /** POST payment-methods/{method}/qr: JPEG, PNG or WebP up to 2 MB, shown from a local object URL. */
    uploadQr(key: PaymentMethod, file: unknown): MethodResult {
      const method = methodOf(key);
      if (!method) return { ok: false, notFound: true };
      if (!(file instanceof File)) return { ok: false, fields: { qr: ["required"] } };
      if (!QR_TYPES.includes(file.type)) return { ok: false, fields: { qr: ["mimes"] } };
      if (file.size > 2 * 1024 * 1024) return { ok: false, fields: { qr: ["max"] } };
      method.qr_url = URL.createObjectURL(file);
      return { ok: true, data: method };
    },

    removeQr(key: PaymentMethod): MethodResult {
      const method = methodOf(key);
      if (!method) return { ok: false, notFound: true };
      method.qr_url = null;
      return { ok: true, data: method };
    },
    app: () => app,

    updateBilling(body: UpdateBillingSettingsBody): Result<BillingSettings> {
      const fields: Fields = {};
      checkCommon(body, fields);
      if (body.exchange_rate_syp !== undefined && body.exchange_rate_syp < 1) fields.exchange_rate_syp = ["min"];
      if (Object.keys(fields).length > 0) return { ok: false, fields };
      const { exchange_rate_syp, ...rest } = body;
      Object.assign(billing, rest);
      // The preview stands in for the server, which stores the rate as a decimal string
      if (exchange_rate_syp !== undefined) billing.exchange_rate_syp = exchange_rate_syp.toFixed(2);
      return { ok: true, data: billing };
    },

    updateApp(body: UpdateAppSettingsBody): Result<AppSettings> {
      const fields: Fields = {};
      checkCommon(body, fields);
      const version = body.merchant_min_app_version;
      if (version && !/^\d+\.\d+\.\d+$/.test(version)) fields.merchant_min_app_version = ["format"];
      // The minimum never goes above the maximum, even when only one of them is sent
      const min = body.card_stamps_min ?? app.card_stamps_min;
      const max = body.card_stamps_max ?? app.card_stamps_max;
      if (min > max) fields[body.card_stamps_min !== undefined ? "card_stamps_min" : "card_stamps_max"] = ["invalid"];
      if (Object.keys(fields).length > 0) return { ok: false, fields };
      Object.assign(app, body, version !== undefined && { merchant_min_app_version: version ?? "" });
      return { ok: true, data: app };
    },
  };
}
