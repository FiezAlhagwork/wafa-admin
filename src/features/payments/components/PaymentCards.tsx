"use client";

import { CaretRight, Info } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui";
import type { AdminPayment, PaymentStatus } from "@/lib/api/types";
import { formatDate, formatRelativeDays, formatSyp, formatTime, formatUsd } from "@/lib/format";
import { formatDuration, rejectionReasonLabels } from "../labels";
import { PaymentBadges, PaymentMerchant, PaymentMethodInline } from "./PaymentParts";

// The small-screen layout of the same list the table shows from `lg`. Four layers, top to bottom:
// who and what state, how much (the biggest thing on the card), how it was paid, when. The whole card is the button.

type PaymentCardsProps = {
  payments: AdminPayment[];
  status: PaymentStatus;
  onOpen: (payment: AdminPayment) => void;
};

export function PaymentCards({ payments, status, onOpen }: PaymentCardsProps) {
  const queue = status === "PENDING";
  const action = queue ? "مراجعة" : "عرض";

  return (
    <ul className="flex flex-col gap-3">
      {payments.map((payment) => (
        <li
          key={payment.id}
          className="relative rounded-2xl border border-ink/6 bg-surface shadow-card transition-colors active:bg-neutral-100 has-focus-visible:ring-2 has-focus-visible:ring-focus has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-bg"
        >
          {/* The tap target covers the whole card; the content above it ignores the pointer so taps reach it */}
          <button
            type="button"
            onClick={() => onOpen(payment)}
            aria-label={`${action} دفعة ${payment.merchant?.business_name ?? `#${payment.id}`}`}
            className="absolute inset-0 rounded-2xl outline-none"
          />

          <div className="pointer-events-none flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <PaymentMerchant payment={payment} />
              <PaymentBadges payment={payment} queue={queue} showReason={false} className="shrink-0" />
            </div>

            {/* The two currencies are never added together: the pounds big (that is what is matched), the dollars beside */}
            <div className="flex items-baseline justify-between gap-3 tabular-nums">
              <span className="text-2xl font-black whitespace-nowrap text-fg">{formatSyp(payment.amount_syp)}</span>
              <span className="text-sm text-fg-muted">{formatUsd(payment.price_usd)}</span>
            </div>

            <div className="flex flex-col gap-1 text-sm text-fg-muted">
              <span>
                {payment.package.name} · {formatDuration(payment.duration_months)}
              </span>
              <PaymentMethodInline payment={payment} />
            </div>

            {payment.rejection_reason && (
              <p className="flex items-center gap-1.5 rounded-md bg-neutral-50 px-2.5 py-1.5 text-sm text-fg">
                <Info aria-hidden className="size-4 shrink-0 text-fg-muted" />
                سبب الرفض: {rejectionReasonLabels[payment.rejection_reason]}
              </p>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-divider pt-3">
              <span className="flex flex-wrap items-baseline gap-x-2 text-sm">
                <span className="text-fg">{formatRelativeDays(payment.created_at)}</span>
                <span className="text-xs text-fg-muted">
                  {formatDate(payment.created_at)} · {formatTime(payment.created_at)}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand">
                {action}
                <CaretRight aria-hidden className="size-4 rtl:-scale-x-100" />
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PaymentCardsSkeleton() {
  return (
    <ul aria-hidden className="flex flex-col gap-3">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="flex flex-col gap-3 rounded-2xl border border-ink/6 bg-surface shadow-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-7 w-44" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-divider pt-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-14" />
          </div>
        </li>
      ))}
    </ul>
  );
}
