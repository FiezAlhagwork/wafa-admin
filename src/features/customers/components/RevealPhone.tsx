"use client";

import { useState } from "react";
import { Eye, EyeSlash, Phone } from "@phosphor-icons/react";
import { ConfirmDialog, CopyValue, Latin, toast } from "@/components/ui";
import { getErrorMessage, toApiError } from "@/lib/api/errors";
import type { AdminCustomer } from "@/lib/api/types";
import { usePermission } from "@/lib/auth/can";
import { useRevealCustomerPhone } from "../hooks";

const linkButton =
  "inline-flex cursor-pointer items-center gap-1 rounded-md text-[13px] font-bold text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus";

/**
 * The masked number, and for `reveal-customer-phone` a «عرض الرقم» behind a confirmation (every reveal is written to
 * the audit log). The full number is kept in this component's state only: hiding it or leaving the page forgets it.
 */
export function RevealPhone({ customer }: { customer: AdminCustomer }) {
  const canReveal = usePermission("reveal-customer-phone");
  const reveal = useRevealCustomerPhone();
  const [confirming, setConfirming] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);

  const confirm = () =>
    reveal.mutate(customer.id, {
      onSuccess: (full) => {
        setPhone(full);
        setConfirming(false);
      },
      onError: (error) => {
        // 403 is shown once by the query client
        if (toApiError(error).code !== "FORBIDDEN") toast.error(getErrorMessage(error));
        setConfirming(false);
      },
    });

  const hide = () => {
    setPhone(null);
    reveal.reset();
  };

  if (!customer.phone_masked) {
    return (
      <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-neutral-50 px-3 text-[13.5px] text-fg-muted">
        <Phone aria-hidden className="size-4" />
        بدون رقم
      </span>
    );
  }

  return (
    <span className="inline-flex h-8 items-center gap-2 rounded-full bg-neutral-50 ps-3 pe-2 text-[13.5px] text-neutral-700">
      <Phone aria-hidden className="size-4 shrink-0 text-fg-muted" />
      {phone ? (
        <>
          <CopyValue value={phone} label="نسخ الرقم" />
          <button type="button" onClick={hide} className={linkButton}>
            <EyeSlash aria-hidden className="size-4" />
            إخفاء
          </button>
        </>
      ) : (
        <>
          <Latin>{customer.phone_masked}</Latin>
          {canReveal && (
            <button type="button" onClick={() => setConfirming(true)} className={linkButton}>
              <Eye aria-hidden className="size-4" />
              عرض الرقم
            </button>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="عرض الرقم كاملاً؟"
        description="سيُسجَّل في سجل التدقيق أنك عرضت رقم هذا الزبون. اعرضه فقط عند الحاجة للتواصل معه."
        confirmLabel="عرض الرقم"
        loading={reveal.isPending}
        onConfirm={confirm}
      />
    </span>
  );
}
