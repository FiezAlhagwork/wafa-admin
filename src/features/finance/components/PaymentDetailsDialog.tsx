"use client";

import { createElement } from "react";
import { ListChecks, Storefront } from "@phosphor-icons/react";
import { Badge, Button, CopyValue, Dialog, StatusBadge } from "@/components/ui";
import { ProofImage, Row, When } from "@/features/payments/components/PaymentDetailParts";
import { MethodIcon } from "@/features/payments/components/PaymentParts";
import { formatDuration, methodLabels, rejectionReasonLabels } from "@/features/payments/labels";
import type { AdminPayment } from "@/lib/api/types";
import { usePermission } from "@/lib/auth/can";
import { formatRate, formatSyp, formatUsd } from "@/lib/format";

type PaymentDetailsDialogProps = {
  /** The row from the history, kept current by the screen (a refetched list brings a fresh `proof_url`). */
  payment: AdminPayment;
  /** Re-fetches the history: the proof link is signed and lasts 30 minutes. */
  refreshing: boolean;
  onRefresh: () => Promise<AdminPayment | undefined>;
  onOpenMerchant: (merchantId: number) => void;
  onOpenQueue: () => void;
  onClose: () => void;
};

/**
 * One payment of the history, read only: nothing is approved or rejected here (that is the review queue's job, and a
 * Super Admin may not do it at all). Mounted only while open.
 */
export function PaymentDetailsDialog({
  payment,
  refreshing,
  onRefresh,
  onOpenMerchant,
  onOpenQueue,
  onClose,
}: PaymentDetailsDialogProps) {
  const canReview = usePermission("review-payments");
  const canOpenMerchant = usePermission("view-merchants-and-customers");
  const merchantId = payment.merchant?.id;
  const reviewed = payment.status !== "PENDING";
  const showQueue = !reviewed && canReview;
  const showMerchant = canOpenMerchant && merchantId !== undefined;

  return (
    <Dialog
      open
      sheet
      onOpenChange={(open) => !open && onClose()}
      size="xl"
      title={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          الدفعة #{payment.id}
          <StatusBadge status={payment.status} />
        </span>
      }
      description={payment.merchant?.business_name ?? "تاجر غير معروف"}
      footer={
        showQueue || showMerchant ? (
          <>
            {showMerchant && (
              <Button variant="secondary" className="max-sm:flex-1" icon={<Storefront className="size-4" />} onClick={() => onOpenMerchant(merchantId)}>
                صفحة التاجر
              </Button>
            )}
            {showQueue && (
              <Button className="max-sm:flex-1" icon={<ListChecks className="size-4" />} onClick={onOpenQueue}>
                افتح في طابور المراجعة
              </Button>
            )}
          </>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4 md:grid md:grid-cols-5 md:items-start md:gap-x-6">
        <div className="order-2 md:order-0 md:col-span-2 md:row-span-2">
          <ProofImage
            key={payment.proof_url}
            url={payment.proof_url}
            loading={false}
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            fetchFreshUrl={async () => (await onRefresh())?.proof_url ?? null}
          />
        </div>

        <div className="order-1 rounded-lg border border-border bg-neutral-50 p-3 md:order-0 md:col-span-3">
          <p className="text-xs text-fg-muted">المبلغ</p>
          <p className="text-2xl font-semibold tabular-nums text-fg">{formatSyp(payment.amount_syp)}</p>
          <p className="text-sm tabular-nums text-fg-muted">
            {formatUsd(payment.price_usd)} · سعر الصرف {formatRate(payment.exchange_rate)}
          </p>
        </div>

        <dl className="order-3 divide-y divide-border rounded-lg border border-border md:order-0 md:col-span-3">
          <Row label="الباقة">
            {payment.package.name} · {formatDuration(payment.duration_months)}
          </Row>
          <Row label="طريقة الدفع">
            <Badge tone="neutral" icon={createElement(MethodIcon[payment.method])}>
              {methodLabels[payment.method]}
            </Badge>
          </Row>
          <Row label="رقم المرجع">
            {payment.reference ? (
              <CopyValue value={payment.reference} label="نسخ رقم المرجع" />
            ) : (
              <span className="text-fg-muted">—</span>
            )}
          </Row>
          <Row label="أُرسلت">
            <When iso={payment.created_at} />
          </Row>
          {payment.merchant?.email && (
            <Row label="البريد">
              <bdi dir="ltr" className="block truncate">
                {payment.merchant.email}
              </bdi>
            </Row>
          )}
          {reviewed && (
            <>
              {payment.rejection_reason && <Row label="سبب الرفض">{rejectionReasonLabels[payment.rejection_reason]}</Row>}
              <Row label="راجعها">{payment.reviewed_by?.name ?? "—"}</Row>
              <Row label="تاريخ المراجعة">{payment.reviewed_at ? <When iso={payment.reviewed_at} /> : "—"}</Row>
                {payment.period_starts_at && (
                  <Row label="بداية الفترة">
                    <When iso={payment.period_starts_at} />
                  </Row>
                )}
            </>
          )}
        </dl>
      </div>
    </Dialog>
  );
}
