"use client";

import { CaretLeft } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui";
import type { AdminMerchant } from "@/lib/api/types";
import { MerchantContact, MerchantIdentity, MerchantPackage, MerchantStatus, RegisteredAt } from "./MerchantParts";

// The small-screen layout of the same list the table shows from `lg`. The whole card is the button (same as payments).

type MerchantCardsProps = {
  merchants: AdminMerchant[];
  onOpen: (merchant: AdminMerchant) => void;
};

export function MerchantCards({ merchants, onOpen }: MerchantCardsProps) {
  return (
    <ul className="flex flex-col gap-3">
      {merchants.map((merchant) => (
        <li
          key={merchant.id}
          className="relative rounded-2xl border border-ink/6 bg-surface shadow-card transition-colors active:bg-neutral-100 has-focus-visible:ring-2 has-focus-visible:ring-focus has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-bg"
        >
          {/* The tap target covers the whole card; the content above it ignores the pointer so taps reach it */}
          <button
            type="button"
            onClick={() => onOpen(merchant)}
            aria-label={`عرض التاجر ${merchant.business_name}`}
            className="absolute inset-0 rounded-2xl outline-none"
          />

          <div className="pointer-events-none flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <MerchantIdentity merchant={merchant} />
              <MerchantStatus merchant={merchant} className="shrink-0 items-end" />
            </div>

            <MerchantContact merchant={merchant} />

            {merchant.package && (
              <div className="text-sm">
                <MerchantPackage merchant={merchant} />
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-divider pt-3">
              <span className="flex flex-wrap items-baseline gap-x-2 text-sm">
                <span className="text-xs text-fg-muted">سجّل</span>
                <RegisteredAt merchant={merchant} />
              </span>
              <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-brand">
                عرض
                <CaretLeft aria-hidden className="size-4" />
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MerchantCardsSkeleton() {
  return (
    <ul aria-hidden className="flex flex-col gap-3">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="flex flex-col gap-3 rounded-2xl border border-ink/6 bg-surface shadow-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10.5 rounded-xl" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-4 w-28" />
          <div className="flex items-center justify-between gap-3 border-t border-divider pt-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-12" />
          </div>
        </li>
      ))}
    </ul>
  );
}
