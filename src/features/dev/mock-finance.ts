// The finance report and the payments history for the development preview (/dev/shell). Never imported outside /dev.
// Built from the preview's own payments (the queue's, which approving and rejecting really change) plus older ones,
// so the report has several months to draw. The sums below are the fake server's, in whole cents: the dashboard itself
// never does math on amounts.

import type { AdminPayment, PaymentMethod, RevenueReport, RevenueTotals } from "@/lib/api/types";
import { todayKey } from "@/lib/format";

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000 - 3 * 3_600_000).toISOString();

const packageIds: Record<string, number> = { الأساسية: 1, المتوسطة: 2, المتقدمة: 3 };
const prices: Record<string, { usd: string; syp: string }> = {
  الأساسية: { usd: "15.00", syp: "195000.00" },
  المتوسطة: { usd: "18.00", syp: "234000.00" },
  المتقدمة: { usd: "90.00", syp: "1170000.00" },
};

const merchants = [
  { id: 104, business_name: "مطعم الفرات", email: "furat@example.com" },
  { id: 105, business_name: "عيادة الشفاء", email: "shifa@example.com" },
  { id: 106, business_name: "متجر النور", email: "alnoor@example.com" },
  { id: 107, business_name: "مكتبة الأفق", email: "ufuq@example.com" },
  { id: 108, business_name: "حلويات السلطان", email: "sultan@example.com" },
  { id: 109, business_name: "نادي القوة الرياضي", email: "power@example.com" },
];
const packageNames = ["الأساسية", "المتوسطة", "المتقدمة"];

/** About 30 older payments over the last seven months, the same every time (no randomness). */
function olderPayments(template: AdminPayment): AdminPayment[] {
  const list: AdminPayment[] = [];
  for (let index = 0; index < 30; index++) {
    const days = 4 + index * 7;
    const merchant = merchants[index % merchants.length];
    const packageName = packageNames[(index * 2) % 3];
    const method: PaymentMethod = index % 3 === 0 ? "haram" : "sham_cash";
    const rejected = index % 7 === 3;
    list.push({
      ...template,
      id: 500 - index,
      package: { ...template.package, id: packageIds[packageName], name: packageName },
      duration_months: 1,
      price_usd: prices[packageName].usd,
      amount_syp: prices[packageName].syp,
      method,
      reference: method === "haram" ? `TX-${41000 + index}` : String(88000000 + index * 137),
      status: rejected ? "REJECTED" : "APPROVED",
      rejection_reason: rejected ? "transfer_not_received" : null,
      created_at: daysAgo(days),
      reviewed_at: daysAgo(days - 1),
      period_starts_at: rejected ? null : daysAgo(days - 1),
      merchant: { ...merchant, status: "ACTIVE" },
      overdue: false,
      duplicate_reference: false,
      reviewed_by: { id: 2, name: "ليلى المراجعة" },
      subscription_period_id: rejected ? null : 900 + index,
    });
  }
  return list;
}

const cents = (amount: string) => {
  const [whole, fraction = "0"] = amount.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0").slice(0, 2));
};
const toAmount = (value: number) => `${Math.floor(value / 100)}.${String(value % 100).padStart(2, "0")}`;

type Sum = { count: number; usd: number; syp: number };
const add = (sum: Sum | undefined, payment: AdminPayment): Sum => ({
  count: (sum?.count ?? 0) + 1,
  usd: (sum?.usd ?? 0) + cents(payment.price_usd),
  syp: (sum?.syp ?? 0) + cents(payment.amount_syp),
});
const totals = (sum: Sum | undefined): RevenueTotals => ({
  count: sum?.count ?? 0,
  price_usd: toAmount(sum?.usd ?? 0),
  amount_syp: toAmount(sum?.syp ?? 0),
});

/** The Damascus day of a moment, "YYYY-MM-DD". */
const dayOf = (iso: string) => todayKey(new Date(iso));
const inRange = (day: string, from?: string, to?: string) => (!from || day >= from) && (!to || day <= to);

export function createFinanceStore(queue: AdminPayment[]) {
  const older = olderPayments(queue[0]);
  const all = () => [...queue, ...older];

  return {
    /** The approved payments by approval day; without days, this month so far. */
    report(params: { from?: string; to?: string }): RevenueReport {
      const today = todayKey();
      const from = params.from ?? `${today.slice(0, 7)}-01`;
      const to = params.to ?? today;
      const approved = all().filter(
        (payment) => payment.status === "APPROVED" && payment.reviewed_at && inRange(dayOf(payment.reviewed_at), from, to),
      );

      let total: Sum | undefined;
      const byMonth = new Map<string, Sum>();
      const byPackage = new Map<number, { name: string; sum: Sum }>();
      const byMethod = new Map<PaymentMethod, Sum>();
      for (const payment of approved) {
        const month = dayOf(payment.reviewed_at!).slice(0, 7);
        total = add(total, payment);
        byMonth.set(month, add(byMonth.get(month), payment));
        const pkg = byPackage.get(payment.package.id);
        byPackage.set(payment.package.id, { name: payment.package.name, sum: add(pkg?.sum, payment) });
        byMethod.set(payment.method, add(byMethod.get(payment.method), payment));
      }

      return {
        from,
        to,
        totals: totals(total),
        by_month: [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, sum]) => ({ month, ...totals(sum) })),
        by_package: [...byPackage.entries()].map(([id, { name, sum }]) => ({ package: { id, name }, ...totals(sum) })),
        by_method: [...byMethod.entries()].map(([method, sum]) => ({ method, ...totals(sum) })),
      };
    },

    /** Every payment, newest first, with the server's filters (days are upload days). */
    history(params: Record<string, string | undefined>): AdminPayment[] {
      return all()
        .filter((payment) => (params.status ? payment.status === params.status : true))
        .filter((payment) => (params.method ? payment.method === params.method : true))
        .filter((payment) => (params.merchant_id ? payment.merchant?.id === Number(params.merchant_id) : true))
        .filter((payment) => inRange(dayOf(payment.created_at), params.from, params.to))
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    },
  };
}
