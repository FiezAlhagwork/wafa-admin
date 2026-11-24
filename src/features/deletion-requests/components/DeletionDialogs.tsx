"use client";

import { useId, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button, ConfirmDialog, Dialog, Field, Notice, Textarea, toast } from "@/components/ui";
import { handleActionError, toastActionError } from "@/lib/api/action-errors";
import { toApiError } from "@/lib/api/errors";
import type { AdminCustomer, AdminMerchantDetail, DeletionRequestInput } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatCount, type CountForms } from "@/lib/format";
import { useCancelMerchantDeletion, useDeleteCustomer, useScheduleMerchantDeletion } from "../hooks";

const NOTE_MAX = 255;
const gifts: CountForms = ["هدية واحدة", "هديتان", "هدايا", "هدية", "هدية"];

const deletionSchema = z.object({
  note: z.string().trim().max(NOTE_MAX, `الملاحظة أطول من ${NOTE_MAX} حرفاً`),
});
type DeletionFormValues = z.infer<typeof deletionSchema>;

type SourceDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  pending: boolean;
  onClose: () => void;
  /** The checked body, and the form's `setError` for the server's 422. */
  onConfirm: (body: DeletionRequestInput, form: ReturnType<typeof useForm<DeletionFormValues>>) => void;
  children?: ReactNode;
};

/**
 * A deletion an admin carries out. Every one of them reached the team through support (an email or a WhatsApp message;
 * the website's deletion page only points there), so the source is always `support` and only an optional note is
 * asked. A customer deleting from the app never comes through here. The account's own facts and what the deletion does
 * sit above the note. Mounted only while open.
 */
function DeletionSourceDialog({ title, description, confirmLabel, pending, onClose, onConfirm, children }: SourceDialogProps) {
  const formId = useId();
  const form = useForm<DeletionFormValues>({ resolver: zodResolver(deletionSchema), defaultValues: { note: "" } });
  const note = useWatch({ control: form.control, name: "note" });
  const errors = form.formState.errors;

  const submit = form.handleSubmit((values) =>
    onConfirm({ source: "support", note: values.note === "" ? null : values.note }, form),
  );

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      size="md"
      sheet
      title={title}
      description={description}
      dismissible={!pending}
      footer={
        <>
          <Button variant="secondary" disabled={pending} onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form={formId} variant="danger" loading={pending}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-4">
        {children}
        <Field
          label="ملاحظة"
          disabled={pending}
          error={errors.note?.message}
          hint={
            <span className="flex items-start justify-between gap-3">
              <span>اختيارية، مثل تاريخ الرسالة أو رقم واتساب الذي وصل منه الطلب.</span>
              <span className={cn("shrink-0 tabular-nums", note.length > NOTE_MAX && "text-danger")}>
                <bdi dir="ltr">
                  {note.length}/{NOTE_MAX}
                </bdi>
              </span>
            </span>
          }
        >
          <Textarea rows={2} maxLength={NOTE_MAX} {...form.register("note")} />
        </Field>
      </form>
    </Dialog>
  );
}

/** Starts the 30-day waiting period. The ready gifts come first, as the rules ask (`stats.rewards_ready`). */
export function ScheduleMerchantDeletionDialog({ merchant, onClose }: { merchant: AdminMerchantDetail; onClose: () => void }) {
  const schedule = useScheduleMerchantDeletion();
  const ready = merchant.stats.rewards_ready;

  return (
    <DeletionSourceDialog
      title={`حذف حساب ${merchant.business_name}؟`}
      description="بطلب من التاجر عبر الدعم. يبدأ بمهلة 30 يوماً يمكن إلغاؤها."
      confirmLabel="جدولة الحذف"
      pending={schedule.isPending}
      onClose={onClose}
      onConfirm={(body, form) =>
        schedule.mutate(
          { id: merchant.id, ...body },
          {
            onSuccess: () => {
              toast.success("تمت جدولة الحذف", { description: "يُنفَّذ بعد 30 يوماً ما لم يُلغَ." });
              onClose();
            },
            onError: (error) =>
              handleActionError(error, { setError: form.setError, onClose, conflicts: ["MERCHANT_STATUS_CONFLICT"] }),
          },
        )
      }
    >
      <Notice tone="warning">
        {ready > 0 ? (
          <>
            لدى زبائنه <b>{formatCount(ready, gifts)} جاهزة</b> لم تُسلَّم بعد. يصلهم إشعار، ويبقى تسليمها ممكناً خلال المهلة.
          </>
        ) : (
          "لا توجد هدايا جاهزة لم تُسلَّم."
        )}
      </Notice>
      <p className="text-sm leading-relaxed text-fg-muted">
        خلال 30 يوماً: لا أختام ولا زبائن جدد ولا حملات. بعدها تُمسح بياناته الشخصية (المالك والبريد والهاتف)، ويبقى
        اسم النشاط وبطاقاته.
      </p>
    </DeletionSourceDialog>
  );
}

/** Done at once and final: the same as the customer deleting their account from the app. */
export function DeleteCustomerDialog({
  customer,
  onClose,
  onDeleted,
}: {
  customer: AdminCustomer;
  onClose: () => void;
  /** After the deletion: the page has nothing left to show. */
  onDeleted: () => void;
}) {
  const remove = useDeleteCustomer();
  const name = customer.name ?? `زبون #${customer.id}`;

  return (
    <DeletionSourceDialog
      title={`حذف حساب ${name}؟`}
      description="بطلب من الزبون عبر الدعم."
      confirmLabel="حذف الحساب نهائياً"
      pending={remove.isPending}
      onClose={onClose}
      onConfirm={(body, form) =>
        remove.mutate(
          { id: customer.id, ...body },
          {
            onSuccess: () => {
              toast.success("تم حذف حساب الزبون");
              onDeleted();
            },
            onError: (error) => handleActionError(error, { setError: form.setError, onClose }),
          },
        )
      }
    >
      <Notice tone="warning">
        <b>يُحذف فوراً ولا يمكن التراجع:</b> تُحذف بطاقاته وطوابعه، كما لو حذف حسابه من التطبيق.
      </Notice>
    </DeletionSourceDialog>
  );
}

/** Ends the waiting period early: the merchant goes back to the status their dates give (or stays suspended). */
export function CancelDeletionDialog({
  requestId,
  name,
  onClose,
}: {
  requestId: number;
  name: string;
  onClose: () => void;
}) {
  const cancel = useCancelMerchantDeletion();

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`إلغاء حذف ${name}؟`}
      description="يعود التاجر إلى حالته حسب تواريخ اشتراكه، أو يبقى موقوفاً إذا كان موقوفاً قبل الطلب."
      confirmLabel="إلغاء الحذف"
      cancelLabel="رجوع"
      loading={cancel.isPending}
      onConfirm={() =>
        cancel.mutate(requestId, {
          onSuccess: () => {
            toast.success("تم إلغاء الحذف", { description: "عاد التاجر إلى حالته." });
            onClose();
          },
          onError: (error) => {
            toastActionError(error);
            // Someone else executed or cancelled it first: nothing left to do here (the list refetches)
            if (["DELETION_REQUEST_NOT_PENDING", "NOT_FOUND", "FORBIDDEN"].includes(toApiError(error).code)) onClose();
          },
        })
      }
    />
  );
}
