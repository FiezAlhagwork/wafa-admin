"use client";

import { useId, type ComponentProps, type FormEventHandler, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type UseFormSetError } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { Field } from "./Field";
import { Textarea } from "./Textarea";

/** The server's limits for `reason` (ReasonInput): after trimming, 3 to 255 characters. */
export const REASON_MIN = 3;
export const REASON_MAX = 255;

type ReasonDialogProps = {
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: string;
  /** `danger` for suspend, remove, delete. */
  tone?: "primary" | "danger";
  /** Usually `mutation.isPending`. While true the dialog can't be closed and the fields are locked. */
  loading?: boolean;
  onClose: () => void;
  /**
   * The form's submit (usually `form.handleSubmit(...)`). The dialog never closes itself: close it from the mutation's
   * onSuccess, so a failed request leaves it open with the reason still typed.
   */
  onSubmit: FormEventHandler<HTMLFormElement>;
  /** The reason textarea's props, usually `form.register("reason")`. */
  reasonProps: ComponentProps<"textarea">;
  /** The typed length, for the counter (`useWatch` on the reason). */
  reasonLength: number;
  /** Already-translated error: from the form's rules or the server's (`applyFieldErrors`). */
  reasonError?: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  /** Extra fields or a note, shown above the reason. */
  children?: ReactNode;
};

/**
 * Every admin action that changes a merchant, card or customer takes a reason that is written to the audit log.
 * One dialog for all of them: the reason field with its counter, the action's own fields above it, and the buttons.
 * Mount it only while open, so a reason never carries over to the next action.
 */
export function ReasonDialog({
  title,
  description,
  confirmLabel,
  tone = "primary",
  loading = false,
  onClose,
  onSubmit,
  reasonProps,
  reasonLength,
  reasonError,
  reasonLabel = "السبب",
  reasonPlaceholder = "اكتب السبب كما سيُقرأ لاحقاً في سجل التدقيق…",
  children,
}: ReasonDialogProps) {
  const formId = useId();

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      size="md"
      sheet
      title={title}
      description={description}
      dismissible={!loading}
      footer={
        <>
          <Button variant="secondary" disabled={loading} onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form={formId} variant={tone} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {children}
        <Field
          label={reasonLabel}
          required
          disabled={loading}
          error={reasonError}
          hint={
            <span className="flex items-start justify-between gap-3">
              <span>يُسجَّل في سجل التدقيق مع اسمك.</span>
              <span className={cn("shrink-0 tabular-nums", reasonLength > REASON_MAX && "text-danger")}>
                <bdi dir="ltr">
                  {reasonLength}/{REASON_MAX}
                </bdi>
              </span>
            </span>
          }
        >
          <Textarea rows={3} maxLength={REASON_MAX} placeholder={reasonPlaceholder} {...reasonProps} />
        </Field>
      </form>
    </Dialog>
  );
}

/** The reason's rules in a zod schema, with the Arabic text shown next to the field. */
export const reasonField = z
  .string()
  .trim()
  .min(REASON_MIN, `اكتب السبب (${REASON_MIN} أحرف على الأقل)`)
  .max(REASON_MAX, `السبب أطول من ${REASON_MAX} حرفاً`);

const reasonOnlySchema = z.object({ reason: reasonField });
type ReasonOnlyValues = z.infer<typeof reasonOnlySchema>;

type ReasonOnlyDialogProps = Omit<
  ReasonDialogProps,
  "onSubmit" | "reasonProps" | "reasonLength" | "reasonError" | "loading"
> & {
  /** Usually `mutation.isPending`. */
  pending: boolean;
  /** The trimmed reason, and `setError` to put the server's 422 on the field (`applyFieldErrors`). */
  onConfirm: (reason: string, setError: UseFormSetError<ReasonOnlyValues>) => void;
};

/** For the actions that take nothing but a reason (suspend, reactivate, remove, cancel a stamp): owns its form. */
export function ReasonOnlyDialog({ onConfirm, pending, ...dialog }: ReasonOnlyDialogProps) {
  const form = useForm<ReasonOnlyValues>({ resolver: zodResolver(reasonOnlySchema), defaultValues: { reason: "" } });
  const reason = useWatch({ control: form.control, name: "reason" });

  return (
    <ReasonDialog
      {...dialog}
      loading={pending}
      onSubmit={form.handleSubmit((values) => onConfirm(values.reason, form.setError))}
      reasonProps={form.register("reason")}
      reasonLength={reason.length}
      reasonError={form.formState.errors.reason?.message}
    />
  );
}
