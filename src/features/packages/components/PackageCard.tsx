"use client";

import { CaretLeft, Megaphone, Package, Stack } from "@phosphor-icons/react";
import { Badge, IconTile, MetaPill, Skeleton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatUsd } from "@/lib/format";
import type { AdminPackage } from "@/lib/api/types";
import { campaignsLimitLabel, cardsLimitLabel, durationLabels, durations } from "../labels";

type PackageCardProps = { pkg: AdminPackage; onOpen: (pkg: AdminPackage) => void };

/** A package as the merchant buys it: its limits and the price of each duration. The whole card opens the edit. */
export function PackageCard({ pkg, onOpen }: PackageCardProps) {
  return (
    <li
      className={cn(
        "relative flex flex-col rounded-2xl border shadow-card transition-colors has-focus-visible:ring-2 has-focus-visible:ring-focus has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-bg",
        pkg.is_active
          ? "border-ink/6 bg-surface hover:border-ink/12"
          : "border-dashed border-border-strong bg-neutral-50 shadow-none",
      )}
    >
      {/* The tap target covers the card; the content above it ignores the pointer so clicks reach it */}
      <button
        type="button"
        onClick={() => onOpen(pkg)}
        aria-label={`تعديل باقة ${pkg.name}`}
        className="absolute inset-0 rounded-2xl outline-none"
      />

      <div className="pointer-events-none flex flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <IconTile icon={<Package />} tone={pkg.is_active ? "amber" : "neutral"} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className={cn("text-lg font-black", pkg.is_active ? "text-fg" : "text-fg-muted")}>{pkg.name}</h2>
              {!pkg.is_active && <Badge>معطّلة</Badge>}
            </div>
            <span className="text-xs text-fg-muted">الترتيب {pkg.sort_order}</span>
          </div>
          <CaretLeft aria-hidden className="mt-2 size-4.5 shrink-0 text-fg-subtle" />
        </div>

        <div className="flex flex-wrap gap-2">
          <MetaPill icon={<Stack />}>{cardsLimitLabel(pkg.cards_limit)}</MetaPill>
          <MetaPill icon={<Megaphone />}>{campaignsLimitLabel(pkg.weekly_campaigns_limit)}</MetaPill>
        </div>

        <dl className="flex flex-col divide-y divide-divider border-t border-divider">
          {durations.map((months) => {
            const price = pkg.prices.find((item) => item.duration_months === months)?.price_usd;
            return (
              <div key={months} className="flex items-baseline justify-between gap-3 py-2.5 last:pb-0">
                <dt className="text-sm text-fg-muted">{durationLabels[months]}</dt>
                <dd>
                  {price ? (
                    <span dir="ltr" className={cn("text-xl font-black tabular-nums", !pkg.is_active && "text-fg-muted")}>
                      {formatUsd(price)}
                    </span>
                  ) : (
                    <span className="text-sm text-fg-muted">غير متاحة</span>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </li>
  );
}

export function PackageCardsSkeleton() {
  return (
    <ul aria-hidden className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="flex flex-col gap-4 rounded-2xl border border-ink/6 bg-surface p-5 shadow-card">
          <div className="flex items-start gap-3">
            <Skeleton className="size-9 rounded-xl" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
          </div>
          <div className="flex flex-col gap-3 border-t border-divider pt-3">
            {durations.map((months) => (
              <div key={months} className="flex items-center justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
