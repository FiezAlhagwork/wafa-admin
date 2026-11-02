import type { Locale } from "@/i18n/routing";

/**
 * Values the privacy policy, terms of use and delete-account pages need, kept in one place.
 * Every field is required: a production build fails while any of them is empty,
 * so the pages can never go live half-done. In dev the pages show a warning instead.
 *
 * After publishing, set `privacy_policy_version` in the dashboard settings to `version`.
 * Changing `version` there makes every customer see the consent screen again.
 */
export const policy = {
  version: "1.0",
  /** Publish date, `YYYY-MM-DD`. Shown as "Last updated". */
  publishedAt: "2026-11-02",
  /** Privacy contact email, e.g. `privacy@example.com`. */
  email: "privacy@wafacard.app",
  /** General support email (terms of use contact: questions, corrections, reporting a shop). */
  supportEmail: "support@wafacard.app",
  /** Phone / WhatsApp in international format, shown as written; wa.me links use its digits only. */
  phone: "+963 997 013 656",
  /** Hosting provider name, e.g. `Hetzner`. */
  hostingProvider: "HardBrain Ltd",
  hostingRegion: { ar: "مراكز بيانات أوروبية (فرانكفورت، ألمانيا)", en: "European data centres (Frankfurt, Germany)" },
  /** How long server backups are kept, e.g. `{ ar: "30 يوماً", en: "30 days" }`. */
  backupRetention: { ar: "30 يوماً", en: "30 days" },
  /** Customer terms of use. Set `customer_terms_url` in the dashboard settings to `/terms`. */
  terms: { version: "1.0", publishedAt: "2026-11-02" },
};

export type PolicyValues = {
  version: string;
  updatedAt: string;
  email: string;
  supportEmail: string;
  phone: string;
  /** `phone` without `+` and spaces, for wa.me links. */
  whatsapp: string;
  hostingProvider: string;
  hostingRegion: string;
  backupRetention: string;
  termsVersion: string;
  termsEffectiveAt: string;
  /** Names of the empty fields (dev only; a production build throws instead). */
  missing: string[];
};

function findMissing(): string[] {
  const missing: string[] = [];
  for (const [key, value] of Object.entries(policy)) {
    if (typeof value === "string") {
      if (!value.trim()) missing.push(key);
    } else {
      for (const [locale, text] of Object.entries(value)) if (!text.trim()) missing.push(`${key}.${locale}`);
    }
  }
  return missing;
}

function formatDate(isoDate: string, locale: Locale) {
  if (!isoDate) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SY-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function getPolicyValues(locale: Locale): PolicyValues {
  const missing = findMissing();
  if (missing.length > 0 && process.env.NODE_ENV === "production") {
    throw new Error(
      `Privacy policy is incomplete. Fill these fields in src/site/legal/policy-config.ts: ${missing.join(", ")}`,
    );
  }

  const placeholder = (value: string) => value.trim() || "—";

  return {
    version: policy.version,
    updatedAt: formatDate(policy.publishedAt, locale),
    email: placeholder(policy.email),
    supportEmail: placeholder(policy.supportEmail),
    phone: placeholder(policy.phone),
    whatsapp: policy.phone.replace(/[^\d]/g, ""),
    hostingProvider: placeholder(policy.hostingProvider),
    hostingRegion: placeholder(policy.hostingRegion[locale]),
    backupRetention: placeholder(policy.backupRetention[locale]),
    termsVersion: policy.terms.version,
    termsEffectiveAt: formatDate(policy.terms.publishedAt, locale),
    missing,
  };
}
