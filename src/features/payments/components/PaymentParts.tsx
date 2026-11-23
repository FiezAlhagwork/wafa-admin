import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import { Bank, DeviceMobile } from "@phosphor-icons/react/ssr";
import { Avatar, Latin, StatusBadge } from "@/components/ui";
import type { AdminPayment, PaymentMethod as Method } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatDate, formatRelativeDays, formatSyp, formatTime, formatUsd } from "@/lib/format";
import { methodLabels, rejectionReasonLabels } from "../labels";

// The same facts are shown by the table (large screens) and by the card (small ones). They live here once,
// so the two layouts can never disagree about how a payment is written.

type PaymentProps = { payment: AdminPayment; className?: string };

/** Merchant name and email. A payment whose merchant is gone shows a dash. */
export function PaymentMerchant({ payment, className }: PaymentProps) {
  if (!payment.merchant) return <span className="text-fg-muted">—</span>;
  const name = payment.merchant.business_name ?? "";

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <Avatar name={name} seed={payment.merchant.id} />
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-bold text-fg">{name}</span>
        {payment.merchant.email && <Latin className="text-[13px] text-fg-muted">{payment.merchant.email}</Latin>}
      </div>
    </div>
  );
}

/** The two currencies are never added together: one line each, the pounds first (that is what is matched to the account). */
export function PaymentAmount({ payment, className }: PaymentProps) {
  return (
    <div className={cn("flex flex-col tabular-nums", className)}>
      <span className="font-medium whitespace-nowrap text-fg">{formatSyp(payment.amount_syp)}</span>
      <span className="text-xs text-fg-muted">{formatUsd(payment.price_usd)}</span>
    </div>
  );
}

/** The icon of each payment method (the review dialog shows it in a badge). */
export const MethodIcon: Record<Method, Icon> = { syriatel_cash: DeviceMobile, transfer: Bank };

const methodIcons: Record<Method, ReactNode> = {
  syriatel_cash: <DeviceMobile aria-hidden className="size-4 shrink-0 text-fg-muted" />,
  transfer: <Bank aria-hidden className="size-4 shrink-0 text-fg-muted" />,
};

/** How it was paid, with the reference under it. */
export function PaymentMethod({ payment, className }: PaymentProps) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <span className="flex items-center gap-1.5 text-fg">
        {methodIcons[payment.method]}
        {methodLabels[payment.method]}
      </span>
      {payment.reference && <Latin className="text-xs text-fg-muted">{payment.reference}</Latin>}
    </div>
  );
}

/** The same facts in one wrapping line, for the card: "🏦 حوالة · TX-30771". */
export function PaymentMethodInline({ payment, className }: PaymentProps) {
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-2 gap-y-0.5", className)}>
      <span className="inline-flex items-center gap-1.5">
        {methodIcons[payment.method]}
        {methodLabels[payment.method]}
      </span>
      {payment.reference && (
        <>
          <span aria-hidden className="text-fg-subtle">
            ·
          </span>
          <bdi dir="ltr">{payment.reference}</bdi>
        </>
      )}
    </span>
  );
}

/** The day on one line, then the time and how long ago on a small line: "14 نوفمبر 2026" / "9:20 ص · منذ يومين". */
export function PaymentSentAt({ payment, className }: PaymentProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="whitespace-nowrap text-fg">{formatDate(payment.created_at)}</span>
      <span className="text-xs whitespace-nowrap text-fg-muted">
        {formatTime(payment.created_at)} · {formatRelativeDays(payment.created_at)}
      </span>
    </div>
  );
}

type PaymentBadgesProps = PaymentProps & {
  /** In the queue tab: the alerts. In the others: the outcome. */
  queue: boolean;
  /** Shown when the queue payment has no alerts (the table shows a dash, the card nothing). */
  empty?: ReactNode;
  /** The rejection reason under the status. The card shows it on a line of its own instead. */
  showReason?: boolean;
};

export function PaymentBadges({ payment, queue, empty = null, showReason = true, className }: PaymentBadgesProps) {
  if (queue) {
    if (!payment.overdue && !payment.duplicate_reference) return empty;
    return (
      <div className={cn("flex flex-wrap gap-1", className)}>
        {payment.overdue && <StatusBadge status="overdue" />}
        {payment.duplicate_reference && <StatusBadge status="duplicate_reference" />}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <StatusBadge status={payment.status} />
      {showReason && payment.rejection_reason && (
        <span className="text-xs text-fg-muted">{rejectionReasonLabels[payment.rejection_reason]}</span>
      )}
    </div>
  );
}
