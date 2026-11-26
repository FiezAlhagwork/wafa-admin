"use client";

import { createElement, useState, type ReactNode } from "react";
import { Warning } from "@phosphor-icons/react";
import { Badge, Button, ConfirmDialog, CopyValue, Dialog, StatusBadge, toast } from "@/components/ui";
import { toastActionError } from "@/lib/api/action-errors";
import { isApiError } from "@/lib/api/errors";
import type { AdminPayment } from "@/lib/api/types";
import { formatRate, formatSyp, formatUsd } from "@/lib/format";
import { useApprovePayment, usePayment } from "../hooks";
import { formatDuration, methodLabels, rejectionReasonLabels } from "../labels";
import { ProofImage, Row, When } from "./PaymentDetailParts";
import { MethodIcon } from "./PaymentParts";
import { RejectPaymentDialog } from "./RejectPaymentDialog";

type PaymentReviewDialogProps = {
  /** The row chosen in the list, or `null` when the dialog is closed. */
  payment: AdminPayment | null;
  onClose: () => void;
};

export function PaymentReviewDialog({ payment, onClose }: PaymentReviewDialogProps) {
  // Mounted only while open (keyed by payment): every opening re-fetches the payment for a fresh proof URL
  return payment ? <ReviewContent key={payment.id} payment={payment} onClose={onClose} /> : null;
}

type Confirm = "approve" | "reject" | null;


function ReviewContent({ payment, onClose }: { payment: AdminPayment; onClose: () => void }) {
  const query = usePayment(payment.id, payment);
  const approve = useApprovePayment();
  const [confirm, setConfirm] = useState<Confirm>(null);

  // The list row is only a placeholder: its `proof_url` may have expired, so the image waits for the fresh fetch
  const current = query.data ?? payment;
  const loadingProof = query.isPending || query.isPlaceholderData;
  const proofUrl = query.isSuccess && !query.isPlaceholderData ? query.data.proof_url : null;

  const queue = current.status === "PENDING";
  const merchantName = current.merchant?.business_name ?? "تاجر غير معروف";

  const handleApprove = () =>
    approve.mutate(current.id, {
      onSuccess: () => {
        toast.success("تم قبول الدفعة", { description: `تم تفعيل اشتراك ${merchantName}.` });
        setConfirm(null);
        onClose();
      },
      onError: (error) => {
        toastActionError(error);
        // Someone else decided first: the hook refetches the payment, which then shows its real state
        if (isApiError(error) && error.code === "PAYMENT_NOT_PENDING") setConfirm(null);
      },
    });

  return (
    <Dialog
      open
      sheet
      onOpenChange={(open) => !open && onClose()}
      size="xl"
      title={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          مراجعة الدفعة #{current.id}
          <StatusBadge status={current.status} />
        </span>
      }
      description={merchantName}
      dismissible={!approve.isPending}
      footer={
        queue ? (
          <>
            <Button variant="danger" className="max-sm:flex-1" disabled={approve.isPending} onClick={() => setConfirm("reject")}>
              رفض
            </Button>
            <Button className="max-sm:flex-1" onClick={() => setConfirm("approve")}>
              قبول الدفعة
            </Button>
          </>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        {(current.overdue || current.duplicate_reference) && (
          <div className="flex flex-col gap-1.5">
            {current.overdue && <Callout>مضى وقت المراجعة المعتاد وهذه الدفعة ما زالت معلّقة.</Callout>}
            {current.duplicate_reference && <Callout>رقم المرجع مستخدم في دفعة أخرى. تحقّق قبل القبول.</Callout>}
          </div>
        )}

        {/* Small screens: amount, picture, details. From `md`: the picture on the start side, amount and details beside it */}
        <div className="flex flex-col gap-4 md:grid md:grid-cols-5 md:items-start md:gap-x-6">
          <div className="order-2 md:order-0 md:col-span-2 md:row-span-2">
            <ProofImage
              key={proofUrl ?? "none"}
              url={proofUrl}
              loading={loadingProof}
              refreshing={query.isFetching}
              onRefresh={() => void query.refetch()}
              fetchFreshUrl={async () => {
                const { data } = await query.refetch();
                return data?.proof_url ?? null;
              }}
            />
          </div>

          {/* What the money should be: the number to match against the account */}
          <div className="order-1 rounded-lg border border-border bg-neutral-50 p-3 md:order-0 md:col-span-3">
            <p className="text-xs text-fg-muted">المبلغ المطلوب</p>
            <p className="text-2xl font-semibold tabular-nums text-fg">{formatSyp(current.amount_syp)}</p>
            <p className="text-sm tabular-nums text-fg-muted">
              {formatUsd(current.price_usd)} · سعر الصرف {formatRate(current.exchange_rate)}
            </p>
          </div>

          <dl className="order-3 divide-y divide-border rounded-lg border border-border md:order-0 md:col-span-3">
            <Row label="الباقة">
              {current.package.name} · {formatDuration(current.duration_months)}
            </Row>
            <Row label="طريقة الدفع">
              <Badge tone="neutral" icon={createElement(MethodIcon[current.method])}>
                {methodLabels[current.method]}
              </Badge>
            </Row>
            <Row label="رقم المرجع">
              {current.reference ? (
                <CopyValue value={current.reference} label="نسخ رقم المرجع" />
              ) : (
                <span className="text-fg-muted">—</span>
              )}
            </Row>
            <Row label="أُرسلت">
              <When iso={current.created_at} />
            </Row>
            {current.merchant?.email && (
              <Row label="البريد">
                <bdi dir="ltr" className="block truncate">
                  {current.merchant.email}
                </bdi>
              </Row>
            )}
            {!queue && (
              <>
                {current.rejection_reason && <Row label="سبب الرفض">{rejectionReasonLabels[current.rejection_reason]}</Row>}
                <Row label="راجعها">{current.reviewed_by?.name ?? "—"}</Row>
                <Row label="تاريخ المراجعة">{current.reviewed_at ? <When iso={current.reviewed_at} /> : "—"}</Row>
                {current.period_starts_at && (
                  <Row label="بداية الفترة">
                    <When iso={current.period_starts_at} />
                  </Row>
                )}
              </>
            )}
          </dl>
        </div>

        {queue && (
          <p className="text-xs text-fg-muted">الصورة وحدها ليست دليلاً: طابق وصول المبلغ إلى الحساب قبل القبول.</p>
        )}
      </div>

      {/* Inside the dialog's tree, so the two stack as nested dialogs (focus and Esc go to the top one) */}
      <ConfirmDialog
        open={confirm === "approve"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="قبول هذه الدفعة؟"
        description={`سيتم تفعيل الاشتراك للتاجر ${merchantName}.`}
        confirmLabel="قبول الدفعة"
        loading={approve.isPending}
        onConfirm={handleApprove}
      >
        <p className="text-sm tabular-nums text-fg-muted">
          {current.package.name} · {formatDuration(current.duration_months)} · {formatSyp(current.amount_syp)}
        </p>
      </ConfirmDialog>

      {confirm === "reject" && (
        <RejectPaymentDialog payment={current} onCancel={() => setConfirm(null)} onRejected={onClose} />
      )}
    </Dialog>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">
      <Warning aria-hidden weight="fill" className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}
