"use client";

import { createElement, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ChartBar, Package, Wallet } from "@phosphor-icons/react";
import { Card, CardHeader, Skeleton, StatCard } from "@/components/ui";
import { MethodIcon } from "@/features/payments/components/PaymentParts";
import { methodLabels } from "@/features/payments/labels";
import type { RevenueReport, RevenueTotals } from "@/lib/api/types";
import { formatCount, formatDay, formatMonth, formatNumber, formatSyp, formatUsd, type CountForms } from "@/lib/format";

export const paymentForms: CountForms = ["دفعة واحدة", "دفعتان", "دفعات", "دفعة", "دفعة"];
const paymentCount = (count: number) => formatCount(count, paymentForms);

/** "1 تشرين الأول 2026 – 24 تشرين الثاني 2026": the days the server actually counted. */
export const rangeLabel = (report: Pick<RevenueReport, "from" | "to">) =>
  report.from === report.to ? formatDay(report.from) : `${formatDay(report.from)} – ${formatDay(report.to)}`;

/** The headline: the pounds big on the ink card, the dollars and the count beside it. The two are never added. */
export function RevenueHeadline({ report }: { report: RevenueReport | undefined }) {
  const loading = !report;
  const totals = report?.totals;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        tone="accent"
        className="sm:col-span-1"
        label="الدخل بالليرة السورية"
        value={totals ? formatSyp(totals.amount_syp) : "—"}
        hint={report && rangeLabel(report)}
        loading={loading}
      />
      <StatCard
        label="الدخل بالدولار"
        value={totals ? formatUsd(totals.price_usd) : "—"}
        icon={<Wallet />}
        iconTone="teal"
        hint="بسعر كل باقة وقت الدفع"
        loading={loading}
      />
      <StatCard
        label="الدفعات المقبولة"
        value={totals ? formatNumber(totals.count) : "—"}
        icon={<ChartBar />}
        hint="حسب يوم القبول"
        loading={loading}
      />
    </div>
  );
}

type MonthRow = RevenueReport["by_month"][number];
type ChartRow = MonthRow & { label: string; bar: number };

/**
 * The pounds of each month as bars. `Number()` gives the bar its height and nothing else: every figure written on the
 * screen comes from the server's string. Under the chart the same months as a list, which is also what a screen reader
 * gets (the chart is hidden from it).
 */
export function MonthlyChart({ report }: { report: RevenueReport }) {
  const months = report.by_month;
  const years = new Set(months.map((row) => row.month.slice(0, 4)));
  const rows: ChartRow[] = months.map((row) => ({
    ...row,
    label: formatMonth(row.month, { year: years.size > 1 }),
    bar: Number(row.amount_syp),
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader icon={<ChartBar />} title="حسب الشهر" description="الليرة السورية، حسب يوم القبول." />
      {/* The chart lays out left to right; `reversed` puts the oldest month on the right, as Arabic reads */}
      <div aria-hidden dir="ltr" className="h-64 px-2 pt-5 sm:px-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--color-divider)" />
            <XAxis
              dataKey="label"
              reversed
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tick={{ fill: "var(--color-fg-muted)", fontSize: 12 }}
            />
            <Tooltip cursor={{ fill: "var(--color-brand-soft)" }} content={MonthTooltip} isAnimationActive={false} />
            <Bar dataKey="bar" fill="var(--color-brand)" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-4 divide-y divide-divider border-t border-divider">
        {/* Newest first in the list, like every other list in the dashboard */}
        {[...months].reverse().map((row) => (
          <li key={row.month} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3">
            <span className="flex flex-col">
              <span className="font-bold text-fg">{formatMonth(row.month)}</span>
              <span className="text-xs text-fg-muted">{paymentCount(row.count)}</span>
            </span>
            <Amounts totals={row} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

// Only what is read here is typed: Recharts passes much more
function MonthTooltip({ active, payload }: { active?: boolean; payload?: readonly { payload?: unknown }[] }) {
  const row = payload?.[0]?.payload as ChartRow | undefined;
  if (!active || !row) return null;
  return (
    <div dir="rtl" className="flex flex-col gap-0.5 rounded-xl border border-ink/6 bg-surface px-3 py-2 text-sm shadow-card">
      <span className="font-bold text-fg">{formatMonth(row.month)}</span>
      <span className="font-medium text-fg tabular-nums">{formatSyp(row.amount_syp)}</span>
      <span className="text-xs text-fg-muted tabular-nums">
        {formatUsd(row.price_usd)} · {paymentCount(row.count)}
      </span>
    </div>
  );
}

/** The pounds over the dollars, at the end of a row. */
function Amounts({ totals }: { totals: RevenueTotals }) {
  return (
    <span className="flex flex-col items-end tabular-nums">
      <span className="font-bold whitespace-nowrap text-fg">{formatSyp(totals.amount_syp)}</span>
      <span className="text-xs text-fg-muted">{formatUsd(totals.price_usd)}</span>
    </span>
  );
}

type BreakdownRow = { key: string; label: string; icon?: ReactNode; totals: RevenueTotals };

function BreakdownCard({ title, icon, rows }: { title: string; icon: ReactNode; rows: BreakdownRow[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader icon={icon} iconTone="teal" title={title} />
      <ul className="divide-y divide-divider">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-4 px-5 py-3">
            <span className="flex min-w-0 items-center gap-2.5">
              {row.icon}
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-bold text-fg">{row.label}</span>
                <span className="text-xs text-fg-muted">{paymentCount(row.totals.count)}</span>
              </span>
            </span>
            <Amounts totals={row.totals} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function ReportBreakdowns({ report }: { report: RevenueReport }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <BreakdownCard
        title="حسب الباقة"
        icon={<Package />}
        rows={report.by_package.map(({ package: pkg, ...totals }) => ({ key: String(pkg.id), label: pkg.name, totals }))}
      />
      <BreakdownCard
        title="حسب طريقة الدفع"
        icon={<Wallet />}
        rows={report.by_method.map(({ method, ...totals }) => ({
          key: method,
          label: methodLabels[method],
          icon: createElement(MethodIcon[method], { "aria-hidden": true, className: "size-5 shrink-0 text-fg-muted" }),
          totals,
        }))}
      />
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4 p-5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-52 w-full rounded-xl" />
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((index) => (
          <Card key={index} className="flex flex-col gap-3 p-5">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
