// Customers and their cycles for the development preview (/dev/shell). Never imported outside /dev.
// Each preview gets its own copy (`createCustomerStore`), so cancelling a stamp or fixing a birthdate really changes it.

import type { AdminCardCycle, AdminCustomer, CycleStamp } from "@/lib/api/types";

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

type CustomerSeed = Omit<AdminCustomer, "cycles"> & { phone: string };

type CycleSeed = Omit<AdminCardCycle, "stamps_count"> & {
  /** The card's status (the cycle detail does not carry it) */
  cardStatus: "active" | "suspended";
};

const stamp = (id: number, days: number, method: CycleStamp["method"] = "qr"): CycleStamp => ({
  id,
  method,
  stamped_at: daysAgo(days),
  cancelled_at: null,
  cancel_reason: null,
  cancelled_by: null,
});

const customerSeeds: CustomerSeed[] = [
  {
    id: 501,
    name: "سارة الحموي",
    phone: "+963933123456",
    phone_masked: "0933***456",
    birthdate: "1996-04-12",
    registered: true,
    registered_at: daysAgo(120),
    last_activity_at: daysAgo(1),
    campaigns_muted: false,
    created_at: daysAgo(120),
  },
  {
    id: 502,
    name: null,
    phone: "+963944555666",
    phone_masked: "0944***666",
    birthdate: null,
    registered: false,
    registered_at: null,
    last_activity_at: daysAgo(4),
    campaigns_muted: true,
    created_at: daysAgo(9),
  },
];

const cycleSeeds = (): CycleSeed[] => [
  // The gift is ready: its last stamp completed the card (cancelling it goes back to collecting)
  {
    id: 9001,
    customer_id: 501,
    merchant: { id: 101, business_name: "كافيه الياسمين" },
    card: { id: 1011, name: "القهوة" },
    cardStatus: "active",
    stamps_required: 5,
    status: "REWARD_READY",
    started_at: daysAgo(20),
    completed_at: daysAgo(1),
    redeemed_at: null,
    stamps: [
      stamp(70011, 20),
      stamp(70012, 15, "phone"),
      { ...stamp(70013, 12), cancelled_at: daysAgo(11), cancel_reason: "طابع مكرر بالغلط", cancelled_by: { id: 1, name: "سامر الحلبي" } },
      stamp(70014, 8),
      stamp(70015, 4),
      stamp(70016, 1),
    ],
  },
  {
    id: 9002,
    customer_id: 501,
    merchant: { id: 104, business_name: "مطعم الفرات" },
    card: { id: 1041, name: "القهوة" },
    cardStatus: "active",
    stamps_required: 5,
    status: "COLLECTING",
    started_at: daysAgo(10),
    completed_at: null,
    redeemed_at: null,
    stamps: [stamp(70021, 10), stamp(70022, 6, "phone"), stamp(70023, 3)],
  },
  // The gift was given out: nothing in it can be cancelled any more
  {
    id: 9003,
    customer_id: 501,
    merchant: { id: 102, business_name: "مخبز الشام" },
    card: { id: 1022, name: "الحلويات" },
    cardStatus: "active",
    stamps_required: 4,
    status: "REWARD_READY",
    started_at: daysAgo(60),
    completed_at: daysAgo(35),
    redeemed_at: daysAgo(33),
    stamps: [stamp(70031, 60), stamp(70032, 50), stamp(70033, 41), stamp(70034, 35)],
  },
  {
    id: 9004,
    customer_id: 501,
    merchant: { id: 109, business_name: "نادي القوة الرياضي" },
    card: { id: 1092, name: "الحلويات" },
    cardStatus: "suspended",
    stamps_required: 8,
    status: "COLLECTING",
    started_at: daysAgo(70),
    completed_at: null,
    redeemed_at: null,
    stamps: [stamp(70041, 70), stamp(70042, 66)],
  },
  // Stamped by phone before ever opening the app
  {
    id: 9005,
    customer_id: 502,
    merchant: { id: 103, business_name: "صالون لمسة للتجميل" },
    card: { id: 1031, name: "القهوة" },
    cardStatus: "active",
    stamps_required: 6,
    status: "COLLECTING",
    started_at: daysAgo(9),
    completed_at: null,
    redeemed_at: null,
    stamps: [stamp(70051, 9, "phone"), stamp(70052, 4, "phone")],
  },
];

const stampsCount = (cycle: CycleSeed) => cycle.stamps.filter((item) => item.cancelled_at === null).length;
const lastActivity = (cycle: CycleSeed) => Math.max(...cycle.stamps.map((item) => Date.parse(item.stamped_at)));

export function createCustomerStore() {
  const customers = customerSeeds.map((seed) => ({ ...seed }));
  const cycles = cycleSeeds();

  const toCycle = (cycle: CycleSeed): AdminCardCycle => ({
    id: cycle.id,
    customer_id: cycle.customer_id,
    merchant: cycle.merchant,
    card: cycle.card,
    stamps_count: stampsCount(cycle),
    stamps_required: cycle.stamps_required,
    status: cycle.status,
    started_at: cycle.started_at,
    completed_at: cycle.completed_at,
    redeemed_at: cycle.redeemed_at,
    stamps: cycle.stamps,
  });

  const toCustomer = (seed: CustomerSeed, withCycles: boolean): AdminCustomer => {
    // The full phone stays in the store: the API only ever answers with the masked one (and the reveal)
    const customer: AdminCustomer = {
      id: seed.id,
      name: seed.name,
      phone_masked: seed.phone_masked,
      birthdate: seed.birthdate,
      registered: seed.registered,
      registered_at: seed.registered_at,
      last_activity_at: seed.last_activity_at,
      campaigns_muted: seed.campaigns_muted,
      created_at: seed.created_at,
    };
    if (!withCycles) return customer;
    return {
      ...customer,
      cycles: cycles
        .filter((cycle) => cycle.customer_id === seed.id)
        .sort((a, b) => lastActivity(b) - lastActivity(a))
        .map((cycle) => ({
          id: cycle.id,
          merchant: cycle.merchant,
          card: { ...cycle.card, status: cycle.cardStatus },
          stamps_count: stampsCount(cycle),
          stamps_required: cycle.stamps_required,
          status: cycle.status,
          started_at: cycle.started_at,
          completed_at: cycle.completed_at,
          redeemed_at: cycle.redeemed_at,
        })),
    };
  };

  return {
    /** `09XXXXXXXX` and `+9639XXXXXXXX` find the same customer, like the server. */
    find: (phone: string) => {
      const normalized = phone.startsWith("09") ? `+963${phone.slice(1)}` : phone;
      const seed = customers.find((item) => item.phone === normalized);
      return seed ? toCustomer(seed, false) : null;
    },
    get: (id: number) => {
      const seed = customers.find((item) => item.id === id);
      return seed ? toCustomer(seed, true) : null;
    },
    phoneOf: (id: number) => customers.find((item) => item.id === id)?.phone ?? null,
    /** Deleted at once, like the server: the customer and their cycles are gone. */
    remove: (id: number) => {
      const index = customers.findIndex((item) => item.id === id);
      if (index >= 0) customers.splice(index, 1);
      for (let i = cycles.length - 1; i >= 0; i--) if (cycles[i]!.customer_id === id) cycles.splice(i, 1);
    },
    setBirthdate: (id: number, birthdate: string) => {
      const seed = customers.find((item) => item.id === id);
      if (seed) seed.birthdate = birthdate;
      return seed ? toCustomer(seed, true) : null;
    },
    cycle: (id: number) => {
      const cycle = cycles.find((item) => item.id === id);
      return cycle ? toCycle(cycle) : null;
    },
    /** Marks it cancelled; the cycle collects again if it had completed. `redeemed` when the gift was given out. */
    cancelStamp: (stampId: number, reason: string, by: { id: number; name: string }) => {
      const cycle = cycles.find((item) => item.stamps.some((entry) => entry.id === stampId));
      if (!cycle) return { result: "not_found" as const };
      if (cycle.redeemed_at) return { result: "redeemed" as const };
      const target = cycle.stamps.find((entry) => entry.id === stampId)!;
      if (target.cancelled_at === null) {
        target.cancelled_at = new Date().toISOString();
        target.cancel_reason = reason;
        target.cancelled_by = by;
        if (cycle.status === "REWARD_READY" && stampsCount(cycle) < cycle.stamps_required) {
          cycle.status = "COLLECTING";
          cycle.completed_at = null;
        }
      }
      return {
        result: "ok" as const,
        data: {
          id: target.id,
          cancelled_at: target.cancelled_at,
          cancel_reason: target.cancel_reason ?? reason,
          cycle: { id: cycle.id, stamps_count: stampsCount(cycle), status: cycle.status, completed_at: cycle.completed_at },
        },
      };
    },
  };
}
