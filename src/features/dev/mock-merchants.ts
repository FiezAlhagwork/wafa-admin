// Merchants for the development preview (/dev/shell): one of every state the screens must handle. Never imported outside /dev.
// Each preview gets its own copy (`createMerchantStore`), so the actions really change it until the scenario switches.

import type { AdminLookup, AdminMerchant } from "@/lib/api/types";

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

export type MerchantSeed = {
  id: number;
  name: string;
  owner: string | null;
  email: string | null;
  phone: string | null;
  /** `null` = still registering. DELETED is in the backend guide but not in the generated type. */
  status: AdminMerchant["status"] | "DELETED";
  step: AdminMerchant["registration_step"];
  packageName: string | null;
  endsInDays: number | null;
  registeredDaysAgo: number;
  suspensionReason?: string;
  /** When an action suspended it (the seeds were suspended 6 days ago) */
  suspendedAt?: string;
  /** The status before a suspension: reactivating goes back to it (or EXPIRED if the dates ran out) */
  statusBeforeSuspension?: MerchantSeed["status"];
  pendingDeletion?: boolean;
  /** The open deletion request (set by the store for `pendingDeletion`, and by scheduling one in the preview) */
  deletion?: { id: number; requested_at: string; executes_at: string };
  /** The status before the deletion was scheduled: cancelling goes back to it */
  statusBeforeDeletion?: MerchantSeed["status"];
  /** An expired trial that never paid: the one EXPIRED merchant whose trial can still be extended */
  neverPaid?: boolean;
  type: string;
  governorate: string;
  /** Set by the actions */
  hasCover?: boolean;
  links?: { instagram_url: string | null; facebook_url: string | null; maps_url: string | null };
  suspendedCardIds?: number[];
};

const noLinks = { instagram_url: null, facebook_url: null, maps_url: null };

/** The business types (`GET /admin/business-types`), one inactive. */
export const businessTypes: AdminLookup[] = [
  "كافيه", "مخبز", "صالون", "مطعم", "عيادة", "متجر", "مكتبة", "حلويات", "نادي رياضي", "بقالة", "مطبعة", "ألعاب أطفال",
].map((name, index) => ({ id: index + 1, name, sort_order: index + 1, is_active: name !== "ألعاب أطفال" }));

const typeOf = (name: string) => businessTypes.find((type) => type.name === name) ?? { id: 0, name };

const seeds: MerchantSeed[] = [
  { id: 101, name: "كافيه الياسمين", owner: "أحمد الصباغ", email: "shop@example.com", phone: "+963933111222", status: "TRIAL", step: "done", packageName: "المتوسطة", endsInDays: 2, registeredDaysAgo: 5, type: "كافيه", governorate: "دمشق" },
  { id: 102, name: "مخبز الشام", owner: "ريم الخطيب", email: "sham.bakery@example.com", phone: "+963944222333", status: "TRIAL", step: "done", packageName: "الأساسية", endsInDays: 6, registeredDaysAgo: 9, type: "مخبز", governorate: "حلب" },
  { id: 103, name: "صالون لمسة للتجميل", owner: "هدى منصور", email: "lamsa@example.com", phone: "+963955333444", status: "TRIAL", step: "done", packageName: "المتقدمة", endsInDays: 12, registeredDaysAgo: 2, type: "صالون", governorate: "دمشق" },
  { id: 104, name: "مطعم الفرات", owner: "خالد العلي", email: "furat@example.com", phone: "+963966444555", status: "ACTIVE", step: "done", packageName: "المتوسطة", endsInDays: 25, registeredDaysAgo: 40, type: "مطعم", governorate: "دير الزور" },
  { id: 105, name: "عيادة الشفاء", owner: "د. سامر نجار", email: "shifa@example.com", phone: "+963977555666", status: "ACTIVE", step: "done", packageName: "المتقدمة", endsInDays: 80, registeredDaysAgo: 75, type: "عيادة", governorate: "حمص" },
  { id: 106, name: "متجر النور", owner: "نور الدين", email: "alnoor@example.com", phone: "+963988666777", status: "ACTIVE", step: "done", packageName: "الأساسية", endsInDays: 9, registeredDaysAgo: 120, type: "متجر", governorate: "اللاذقية" },
  { id: 107, name: "مكتبة الأفق", owner: "ليلى حداد", email: "ufuq@example.com", phone: "+963999777888", status: "GRACE", step: "done", packageName: "المتوسطة", endsInDays: -2, registeredDaysAgo: 200, type: "مكتبة", governorate: "دمشق" },
  { id: 108, name: "حلويات السلطان", owner: "عمر السلطان", email: "sultan@example.com", phone: "+963911888999", status: "EXPIRED", step: "done", packageName: "الأساسية", endsInDays: -30, registeredDaysAgo: 260, type: "حلويات", governorate: "حلب" },
  { id: 109, name: "نادي القوة الرياضي", owner: "باسل يوسف", email: "power@example.com", phone: "+963922999000", status: "SUSPENDED", step: "done", packageName: "المتقدمة", endsInDays: 40, registeredDaysAgo: 150, suspensionReason: "مخالفة شروط الاستخدام: عروض مضللة", type: "نادي رياضي", governorate: "طرطوس" },
  { id: 110, name: "بقالة الحي", owner: "منى الأحمد", email: "hayy@example.com", phone: "+963933000111", status: "PENDING_DELETION", step: "done", packageName: "الأساسية", endsInDays: 10, registeredDaysAgo: 90, pendingDeletion: true, type: "بقالة", governorate: "حماة" },
  { id: 111, name: "متجر أُغلق", owner: null, email: null, phone: null, status: "DELETED", step: "done", packageName: "الأساسية", endsInDays: -60, registeredDaysAgo: 300, type: "متجر", governorate: "دمشق" },
  { id: 112, name: "مقهى الورد", owner: "رنا فياض", email: "warda@example.com", phone: "+963944111222", status: null, step: "package", packageName: null, endsInDays: null, registeredDaysAgo: 1, type: "كافيه", governorate: "دمشق" },
  { id: 114, name: "مشغل الأمل", owner: "سلمى درويش", email: "amal@example.com", phone: "+963966333444", status: "EXPIRED", step: "done", packageName: "الأساسية", endsInDays: -4, registeredDaysAgo: 20, neverPaid: true, type: "متجر", governorate: "حمص" },
  { id: 113, name: "مطبعة الإبداع", owner: "فادي حسن", email: "ibdaa@example.com", phone: "+963955222333", status: null, step: "pin", packageName: "الأساسية", endsInDays: null, registeredDaysAgo: 3, type: "مطبعة", governorate: "حلب" },
];

const cover = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><rect width="1200" height="600" fill="#7A3E1D"/><circle cx="930" cy="300" r="210" fill="#F2B134"/><circle cx="930" cy="300" r="120" fill="#7A3E1D"/><rect x="110" y="210" width="560" height="64" rx="32" fill="#FFFFFF"/><rect x="110" y="310" width="380" height="40" rx="20" fill="#FFFFFF" opacity=".7"/><rect x="0" y="540" width="1200" height="60" fill="#17A398"/></svg>`,
)}`;

const packageOf = (name: string) => ({
  id: name === "الأساسية" ? 1 : name === "المتوسطة" ? 2 : 3,
  name,
  cards_limit: name === "الأساسية" ? 1 : name === "المتوسطة" ? 3 : 5,
  weekly_campaigns_limit: name === "الأساسية" ? 1 : name === "المتوسطة" ? 2 : 4,
});

export const toMerchant = (seed: MerchantSeed) => ({
  id: seed.id,
  business_name: seed.name,
  owner_name: seed.owner,
  email: seed.email,
  phone: seed.phone,
  contact_phone: seed.phone && seed.id % 2 === 0 ? "+963112223344" : null,
  logo_url: null,
  business_type: { id: typeOf(seed.type).id, name: seed.type },
  governorate: { id: 1, name: seed.governorate },
  status: seed.status,
  registration_step: seed.step,
  package: seed.packageName ? packageOf(seed.packageName) : null,
  subscription_ends_at: seed.endsInDays === null ? null : inDays(seed.endsInDays),
  suspended_at: seed.suspendedAt ?? (seed.suspensionReason ? daysAgo(6) : null),
  suspension_reason: seed.suspensionReason ?? null,
  registered_at: daysAgo(seed.registeredDaysAgo),
});

export function toMerchantDetail(seed: MerchantSeed) {
  const pkg = seed.packageName ? packageOf(seed.packageName) : null;
  const hasSubscription = seed.status !== null && pkg !== null;
  const paid = hasSubscription && seed.status !== "TRIAL" && !seed.neverPaid;

  return {
    ...toMerchant(seed),
    cover_url: seed.hasCover ? cover : null,
    address: seed.owner ? "شارع الحمرا، بناء 12" : null,
    links: { ...(seed.links ?? noLinks) },
    last_login_at: seed.status === null ? null : hoursAgo(seed.id % 48),
    subscription: hasSubscription
      ? {
          status: seed.status,
          // 114 used the trial before with the same email and chose no package: the API sends `package: null`
          package: seed.id === 114 ? null : pkg,
          current_period: null,
          trial_used: true,
          days_remaining: seed.endsInDays !== null && seed.endsInDays > 0 ? seed.endsInDays : null,
          capabilities: {},
          banner: null,
          pending_payment: seed.id === 106 ? { created_at: hoursAgo(5) } : null,
        }
      : null,
    periods: hasSubscription
      ? [
          { id: 2, type: paid ? "paid" : "trial", package: pkg, duration_months: paid ? 3 : null, starts_at: daysAgo(30), ends_at: inDays(seed.endsInDays ?? 0), grace_ends_at: seed.status === "GRACE" ? inDays(1) : null },
          ...(paid
            ? [{ id: 1, type: "trial", package: pkg, duration_months: null, starts_at: daysAgo(seed.registeredDaysAgo), ends_at: daysAgo(30), grace_ends_at: null }]
            : []),
        ]
      : [],
    payments: paid
      ? [
          { id: 901, package: pkg, duration_months: 3, price_usd: "45.50", exchange_rate: "13000.0000", amount_syp: "591500.00", method: "sham_cash", reference: "94817263", proof_url: "", status: "APPROVED", rejection_reason: null, created_at: daysAgo(30), reviewed_at: daysAgo(29), period_starts_at: daysAgo(29) },
          { id: 902, package: pkg, duration_months: 1, price_usd: "18.00", exchange_rate: "13000.0000", amount_syp: "234000.00", method: "haram", reference: "TX-30771", proof_url: "", status: "REJECTED", rejection_reason: "amount_short", created_at: daysAgo(35), reviewed_at: daysAgo(34), period_starts_at: null },
        ]
      : [],
    cards:
      seed.status === null
        ? []
        : [
            { id: seed.id * 10 + 1, name: "القهوة", icon_key: "coffee", stamps_required: 5, reward_description: "قهوة مجانية", terms: null, customers_count: 42, created_at: daysAgo(20) },
            { id: seed.id * 10 + 2, name: "الحلويات", icon_key: "cake", stamps_required: 8, reward_description: "قطعة حلوى مجانية", terms: null, customers_count: 17, created_at: daysAgo(10) },
          ].map((card) => {
            const suspended = seed.suspendedCardIds?.includes(card.id) ?? false;
            return { ...card, status: suspended ? "suspended" : "active", suspended_at: suspended ? daysAgo(card.id % 10 === 2 ? 6 : 0) : null };
          }),
    stats:
      seed.status === null
        ? { customers_total: 0, stamps_total: 0, stamps_via_phone_total: 0, rewards_ready: 0, rewards_redeemed_total: 0, campaigns_total: 0 }
        : { customers_total: 59, stamps_total: 310, stamps_via_phone_total: 25, rewards_ready: 3, rewards_redeemed_total: 51, campaigns_total: 4 },
    deletion: seed.deletion ?? null,
  };
}

/** A fresh copy of the merchants for one preview: the actions change it, and switching the scenario starts over. */
export function createMerchantStore(): MerchantSeed[] {
  return seeds.map((seed) => ({
    ...seed,
    hasCover: seed.id === 104,
    // The same request as in the deletion list (mock-deletions.ts, id 7): 25 of its 30 days gone
    deletion: seed.pendingDeletion ? { id: 7, requested_at: daysAgo(25), executes_at: inDays(5) } : undefined,
    statusBeforeDeletion: seed.pendingDeletion ? "ACTIVE" : undefined,
    // 104 has all three links, 101 only Instagram, the others none
    links:
      seed.id === 104
        ? {
            instagram_url: "https://www.instagram.com/alfurat.restaurant/",
            facebook_url: "https://www.facebook.com/alfurat.deirezzor",
            maps_url: "https://maps.app.goo.gl/x7Kq2mVb9Rt3",
          }
        : seed.id === 101
          ? { ...noLinks, instagram_url: "https://instagram.com/yasmin.cafe" }
          : { ...noLinks },
    // A suspended merchant's second card was paused too
    suspendedCardIds: seed.status === "SUSPENDED" ? [seed.id * 10 + 2] : [],
  }));
}

/** The same filters the real API has: status, registration_step, trial_ending and q (2 characters or more). Newest first. */
export function filterMerchantSeeds(store: MerchantSeed[], params: Record<string, string | undefined>) {
  const q = params.q && params.q.trim().length >= 2 ? params.q.trim().toLowerCase() : null;
  return store
    .filter((seed) => (params.status ? seed.status === params.status : true))
    .filter((seed) => (params.registration_step ? seed.status === null && seed.step === params.registration_step : true))
    .filter((seed) => (params.trial_ending === "week" ? seed.status === "TRIAL" && seed.endsInDays !== null && seed.endsInDays <= 7 : true))
    .filter((seed) => (q === null ? true : [seed.name, seed.email ?? "", seed.phone ?? ""].some((field) => field.toLowerCase().includes(q))))
    .sort((a, b) => a.registeredDaysAgo - b.registeredDaysAgo);
}
