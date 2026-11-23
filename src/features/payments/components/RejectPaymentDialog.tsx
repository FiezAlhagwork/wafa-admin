"use client";

import { useState } from "react";
import { Button, Dialog, RadioGroup, toast } from "@/components/ui";
import { toastActionError } from "@/lib/api/action-errors";
import { isApiError } from "@/lib/api/errors";
import type { AdminPayment, PaymentRejectionReason } from "@/lib/api/types";
import { useRejectPayment } from "../hooks";
import { rejectionReasonOptions } from "../labels";

type RejectPaymentDialogProps = {
  payment: AdminPayment;
  /** Close without rejecting. */
  onCancel: () => void;
  /** The payment was rejected: close everything. */
  onRejected: () => void;
};

/** Mounted only while open, so the chosen reason never carries over to the next payment. */
export function RejectPaymentDialog({ payment, onCancel, onRejected }: RejectPaymentDialogProps) {
  const [reason, setReason] = useState<PaymentRejectionReason | null>(null);
  const reject = useRejectPayment();

  const submit = () => {
    if (reason === null) return;
    reject.mutate(
      { id: payment.id, reason },
      {
        onSuccess: () => {
          toast.success("تم رفض الدفعة", { description: "سيصل السبب للتاجر ويمكنه إرسال دفعة جديدة." });
          onRejected();
        },
        onError: (error) => {
          toastActionError(error);
          // Someone else decided first: the item is refetched by the hook, there is nothing left to reject here
          if (isApiError(error) && error.code === "PAYMENT_NOT_PENDING") onCancel();
        },
      },
    );
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onCancel()}
      size="sm"
      title="رفض الدفعة"
      description="اختر السبب: يصل التاجر ويمكنه إرسال دفعة جديدة."
      dismissible={!reject.isPending}
      footer={
        <>
          <Button variant="secondary" disabled={reject.isPending} onClick={onCancel}>
            إلغاء
          </Button>
          <Button variant="danger" loading={reject.isPending} disabled={reason === null} onClick={submit}>
            رفض الدفعة
          </Button>
        </>
      }
    >
      <RadioGroup
        label="سبب الرفض"
        value={reason}
        onValueChange={setReason}
        options={rejectionReasonOptions}
        disabled={reject.isPending}
      />
    </Dialog>
  );
}
