"use client";

import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Warning } from "@phosphor-icons/react";
import { Controller, useForm, useWatch, type FieldValues, type UseFormSetError } from "react-hook-form";
import { Button, Field, Input, ReasonDialog, Select, toast } from "@/components/ui";
import { useBusinessTypes } from "@/features/lookups/hooks";
import { applyFieldErrors, getErrorMessage, toApiError } from "@/lib/api/errors";
import type { AdminMerchantDetail, MerchantCard, UpdateMerchantIdentityBody } from "@/lib/api/types";
import { usePermission } from "@/lib/auth/can";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import {
  useExtendTrial,
  useReactivateMerchant,
  useRemoveMerchantCover,
  useSuspendCard,
  useSuspendMerchant,
  useUpdateMerchantIdentity,
} from "../hooks";
import {
  extendTrialSchema,
  identitySchema,
  reasonSchema,
  type ExtendTrialFormInput,
  type ExtendTrialFormValues,
  type IdentityFormValues,
  type ReasonFormValues,
} from "../schemas";

/** What the merchant page can ask for. One dialog at a time, mounted only while open. */
export type MerchantAction =
  | { type: "edit" }
  | { type: "extend" }
  | { type: "suspend" }
  | { type: "reactivate" }
  | { type: "remove-cover" }
  | { type: "suspend-card"; card: MerchantCard };

type DialogProps = { merchant: AdminMerchantDetail; onClose: () => void };

/** The merchant changed under us (or is gone): nothing left to do in this dialog. The hook refetches the page. */
const closingCodes = new Set(["MERCHANT_STATUS_CONFLICT", "TRIAL_NOT_EXTENDABLE", "NOT_FOUND", "FORBIDDEN"]);

/**
 * A 422 goes next to its field and the dialog stays open. 403 and 429 are shown once by the query client.
 * Anything else is a toast; a conflict also closes the dialog, since the page is being refetched.
 */
function handleActionError<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>, onClose: () => void) {
  if (applyFieldErrors(error, setError)) return;
  const { code } = toApiError(error);
  if (code !== "FORBIDDEN" && code !== "RATE_LIMITED") toast.error(getErrorMessage(error));
  if (closingCodes.has(code)) onClose();
}

function Note({ tone = "info", children }: { tone?: "info" | "warning"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm leading-relaxed",
        tone === "warning" ? "bg-warning-soft text-fg" : "bg-neutral-50 text-fg",
      )}
    >
      {tone === "warning" ? (
        <Warning aria-hidden weight="fill" className="mt-0.5 size-4.5 shrink-0 text-warning" />
      ) : (
        <Info aria-hidden weight="fill" className="mt-0.5 size-4.5 shrink-0 text-fg-muted" />
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

type ReasonOnlyDialogProps = {
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: string;
  tone?: "primary" | "danger";
  pending: boolean;
  onClose: () => void;
  onConfirm: (reason: string, setError: UseFormSetError<ReasonFormValues>) => void;
  children?: ReactNode;
};

/** The actions that take nothing but a reason. */
function ReasonOnlyDialog({ onConfirm, pending, children, ...dialog }: ReasonOnlyDialogProps) {
  const form = useForm<ReasonFormValues>({ resolver: zodResolver(reasonSchema), defaultValues: { reason: "" } });
  const reason = useWatch({ control: form.control, name: "reason" });

  return (
    <ReasonDialog
      {...dialog}
      loading={pending}
      onSubmit={form.handleSubmit((values) => onConfirm(values.reason, form.setError))}
      reasonProps={form.register("reason")}
      reasonLength={reason.length}
      reasonError={form.formState.errors.reason?.message}
    >
      {children}
    </ReasonDialog>
  );
}

function SuspendMerchantDialog({ merchant, onClose }: DialogProps) {
  const suspend = useSuspendMerchant();

  return (
    <ReasonOnlyDialog
      title={`إيقاف ${merchant.business_name}؟`}
      description="للاحتيال أو مخالفة الشروط. يمكن إعادة تفعيله لاحقاً."
      confirmLabel="إيقاف التاجر"
      tone="danger"
      pending={suspend.isPending}
      onClose={onClose}
      onConfirm={(reason, setError) =>
        suspend.mutate(
          { id: merchant.id, reason },
          {
            onSuccess: () => {
              toast.success("تم إيقاف التاجر", { description: "يظهر السبب في صفحته وفي سجل التدقيق." });
              onClose();
            },
            onError: (error) => handleActionError(error, setError, onClose),
          },
        )
      }
    >
      <Note tone="warning">
        لا أختام ولا زبائن جدد ولا حملات، ويختفي من دليل المحلات. <b>تسليم الهدايا الجاهزة يبقى شغّالاً.</b>
      </Note>
    </ReasonOnlyDialog>
  );
}

function ReactivateMerchantDialog({ merchant, onClose }: DialogProps) {
  const reactivate = useReactivateMerchant();

  return (
    <ReasonOnlyDialog
      title={`إعادة تفعيل ${merchant.business_name}؟`}
      confirmLabel="إعادة التفعيل"
      pending={reactivate.isPending}
      onClose={onClose}
      onConfirm={(reason, setError) =>
        reactivate.mutate(
          { id: merchant.id, reason },
          {
            onSuccess: () => {
              toast.success("تمت إعادة تفعيل التاجر");
              onClose();
            },
            onError: (error) => handleActionError(error, setError, onClose),
          },
        )
      }
    >
      <Note>
        تعود حالته حسب تواريخ اشتراكه الآن: إذا انتهى الاشتراك أثناء الإيقاف يصبح «منتهي» حتى يدفع.
      </Note>
    </ReasonOnlyDialog>
  );
}

function RemoveCoverDialog({ merchant, onClose }: DialogProps) {
  const remove = useRemoveMerchantCover();

  return (
    <ReasonOnlyDialog
      title="إزالة الغلاف؟"
      description="لغلاف غير لائق. يختفي من صفحة المحل، ويستطيع التاجر رفع غلاف آخر."
      confirmLabel="إزالة الغلاف"
      tone="danger"
      pending={remove.isPending}
      onClose={onClose}
      onConfirm={(reason, setError) =>
        remove.mutate(
          { id: merchant.id, reason },
          {
            onSuccess: () => {
              toast.success("تمت إزالة الغلاف");
              onClose();
            },
            onError: (error) => handleActionError(error, setError, onClose),
          },
        )
      }
    />
  );
}

function SuspendCardDialog({ merchant, card, onClose }: DialogProps & { card: MerchantCard }) {
  const suspend = useSuspendCard();

  return (
    <ReasonOnlyDialog
      title={`إيقاف بطاقة «${card.name}»؟`}
      description={`لمحتوى غير مناسب في بطاقة ${merchant.business_name}.`}
      confirmLabel="إيقاف البطاقة"
      tone="danger"
      pending={suspend.isPending}
      onClose={onClose}
      onConfirm={(reason, setError) =>
        suspend.mutate(
          { id: card.id, reason },
          {
            onSuccess: () => {
              toast.success("تم إيقاف البطاقة");
              onClose();
            },
            onError: (error) => handleActionError(error, setError, onClose),
          },
        )
      }
    >
      <Note>
        لا تقبل أختاماً جديدة، والهدايا المستحقة لزبائنها ({card.customers_count} زبون) تُسلَّم عادي.
      </Note>
    </ReasonOnlyDialog>
  );
}

const WEEK_MS = 7 * 86_400_000;

/** The time the dialog opened (it is mounted on open): read once, so a re-render never changes what it says. */
const useOpenedAt = () => useState(() => Date.now())[0];

function EditIdentityDialog({ merchant, onClose }: DialogProps) {
  const update = useUpdateMerchantIdentity();
  // The type list needs `manage-lookups` (A06 in Notion): a role without it edits the name only
  const canChangeType = usePermission("manage-lookups");
  const types = useBusinessTypes({ enabled: canChangeType });

  const currentType = String(merchant.business_type.id);
  const form = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: { business_name: merchant.business_name, business_type_id: currentType, reason: "" },
  });
  const reason = useWatch({ control: form.control, name: "reason" });
  const errors = form.formState.errors;
  const pending = update.isPending;

  // Active types, plus the merchant's own even if it was deactivated since (so the field never shows blank)
  const typeOptions = (types.data ?? [])
    .filter((type) => type.is_active || String(type.id) === currentType)
    .map((type) => ({ value: String(type.id), label: type.name }));
  if (!typeOptions.some((option) => option.value === currentType)) {
    typeOptions.unshift({ value: currentType, label: merchant.business_type.name });
  }

  const openedAt = useOpenedAt();
  const registeredLongAgo = openedAt - Date.parse(merchant.registered_at) > WEEK_MS;

  const submit = form.handleSubmit((values) => {
    // Only what changed
    const changes: Omit<UpdateMerchantIdentityBody, "reason"> = {};
    if (values.business_name !== merchant.business_name) changes.business_name = values.business_name;
    if (canChangeType && values.business_type_id !== currentType) changes.business_type_id = Number(values.business_type_id);
    if (Object.keys(changes).length === 0) {
      form.setError("business_name", { message: canChangeType ? "لم يتغيّر شيء: عدّل الاسم أو النوع" : "لم يتغيّر الاسم" });
      return;
    }

    update.mutate(
      { id: merchant.id, ...changes, reason: values.reason },
      {
        onSuccess: () => {
          toast.success("تم حفظ بيانات النشاط");
          onClose();
        },
        onError: (error) => handleActionError(error, form.setError, onClose),
      },
    );
  });

  return (
    <ReasonDialog
      title="تعديل بيانات النشاط"
      description="لتصحيح اسم النشاط أو نوعه. يظهر التعديل للتاجر وزبائنه."
      confirmLabel="حفظ"
      loading={pending}
      onClose={onClose}
      onSubmit={submit}
      reasonProps={form.register("reason")}
      reasonLength={reason.length}
      reasonError={errors.reason?.message}
    >
      {registeredLongAgo && (
        <Note tone="warning">
          سُجّل هذا التاجر قبل أكثر من أسبوع ({formatDate(merchant.registered_at)}). تأكّد أن التعديل تصحيح وليس تغييراً
          لهوية النشاط.
        </Note>
      )}

      <Field label="اسم النشاط" required disabled={pending} error={errors.business_name?.message}>
        <Input autoComplete="off" maxLength={80} {...form.register("business_name")} />
      </Field>

      {canChangeType ? (
        <Controller
          control={form.control}
          name="business_type_id"
          render={({ field }) => (
            <Field
              label="نوع النشاط"
              disabled={pending || types.isPending}
              error={errors.business_type_id?.message}
              hint={types.isError ? "تعذّر تحميل قائمة الأنواع، فيبقى النوع الحالي." : undefined}
            >
              <Select value={field.value} onValueChange={field.onChange} options={typeOptions} />
            </Field>
          )}
        />
      ) : (
        <Field label="نوع النشاط" disabled hint="تغيير النوع عند المدير: قائمة الأنواع غير متاحة لدورك.">
          <Input value={merchant.business_type.name} readOnly />
        </Field>
      )}
    </ReasonDialog>
  );
}

const quickDays = [7, 14, 30];

function ExtendTrialDialog({ merchant, onClose }: DialogProps) {
  const extend = useExtendTrial();
  const form = useForm<ExtendTrialFormInput, unknown, ExtendTrialFormValues>({
    resolver: zodResolver(extendTrialSchema),
    defaultValues: { days: "", reason: "" },
  });
  const [reason, days] = useWatch({ control: form.control, name: ["reason", "days"] });
  const errors = form.formState.errors;
  const pending = extend.isPending;

  const endsAt = merchant.subscription_ends_at;
  const openedAt = useOpenedAt();
  const ended = endsAt === null || Date.parse(endsAt) < openedAt;

  const submit = form.handleSubmit((values) =>
    extend.mutate(
      { id: merchant.id, days: values.days, reason: values.reason },
      {
        onSuccess: () => {
          toast.success("تم تمديد التجربة", { description: `أُضيف ${values.days} يوماً.` });
          onClose();
        },
        onError: (error) => handleActionError(error, form.setError, onClose),
      },
    ),
  );

  return (
    <ReasonDialog
      title="تمديد التجربة"
      description={
        ended
          ? "التجربة منتهية: تُحسب الأيام من اليوم ويعود التاجر إلى «تجربة»."
          : `تنتهي التجربة ${formatDate(endsAt)}، وتُضاف الأيام بعد هذا التاريخ.`
      }
      confirmLabel="تمديد"
      loading={pending}
      onClose={onClose}
      onSubmit={submit}
      reasonProps={form.register("reason")}
      reasonLength={reason.length}
      reasonError={errors.reason?.message}
    >
      <Field label="عدد الأيام" required disabled={pending} error={errors.days?.message} hint="من 1 إلى 90 يوماً.">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            dir="ltr"
            inputMode="numeric"
            autoComplete="off"
            className="w-28 text-center tabular-nums"
            {...form.register("days")}
          />
          {quickDays.map((value) => (
            <Button
              key={value}
              size="sm"
              variant="secondary"
              disabled={pending}
              aria-pressed={days === String(value)}
              className="aria-pressed:border-brand aria-pressed:bg-brand-soft aria-pressed:text-brand"
              onClick={() => form.setValue("days", String(value), { shouldValidate: form.formState.isSubmitted })}
            >
              {value} يوماً
            </Button>
          ))}
        </div>
      </Field>
    </ReasonDialog>
  );
}

/** The open action's dialog, or nothing. */
export function MerchantActionDialog({ action, ...props }: DialogProps & { action: MerchantAction | null }) {
  switch (action?.type) {
    case "edit":
      return <EditIdentityDialog {...props} />;
    case "extend":
      return <ExtendTrialDialog {...props} />;
    case "suspend":
      return <SuspendMerchantDialog {...props} />;
    case "reactivate":
      return <ReactivateMerchantDialog {...props} />;
    case "remove-cover":
      return <RemoveCoverDialog {...props} />;
    case "suspend-card":
      return <SuspendCardDialog {...props} card={action.card} />;
    default:
      return null;
  }
}
