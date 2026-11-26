"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch, type FieldValues, type UseFormSetError } from "react-hook-form";
import { Button, Field, Input, Latin, Notice, ReasonDialog, ReasonOnlyDialog, Select, toast } from "@/components/ui";
import { CancelDeletionDialog, ScheduleMerchantDeletionDialog } from "@/features/deletion-requests/components/DeletionDialogs";
import { useBusinessTypes } from "@/features/lookups/hooks";
import { handleActionError } from "@/lib/api/action-errors";
import type { AdminMerchantDetail, MerchantCard, MerchantLink, UpdateMerchantIdentityBody } from "@/lib/api/types";
import { usePermission } from "@/lib/auth/can";
import { formatDate } from "@/lib/format";
import {
  useExtendTrial,
  useReactivateMerchant,
  useRemoveMerchantCover,
  useRemoveMerchantLink,
  useSuspendCard,
  useSuspendMerchant,
  useUpdateMerchantIdentity,
} from "../hooks";
import { merchantLinks } from "../links";
import {
  extendTrialSchema,
  identitySchema,
  type ExtendTrialFormInput,
  type ExtendTrialFormValues,
  type IdentityFormValues,
} from "../schemas";

/** What the merchant page can ask for. One dialog at a time, mounted only while open. */
export type MerchantAction =
  | { type: "edit" }
  | { type: "extend" }
  | { type: "suspend" }
  | { type: "reactivate" }
  | { type: "remove-cover" }
  | { type: "remove-link"; link: MerchantLink }
  | { type: "delete" }
  | { type: "cancel-deletion" }
  | { type: "suspend-card"; card: MerchantCard };

type DialogProps = { merchant: AdminMerchantDetail; onClose: () => void };

/** Someone else changed the merchant first: the dialog closes and the page is refetched. */
const conflicts = ["MERCHANT_STATUS_CONFLICT", "TRIAL_NOT_EXTENDABLE"] as const;

const onActionError =
  <T extends FieldValues>(setError: UseFormSetError<T>, onClose: () => void) =>
  (error: unknown) =>
    handleActionError(error, { setError, onClose, conflicts: [...conflicts] });

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
            onError: onActionError(setError, onClose),
          },
        )
      }
    >
      <Notice tone="warning">
        لا أختام ولا زبائن جدد ولا حملات، ويختفي من دليل المحلات. <b>تسليم الهدايا الجاهزة يبقى شغّالاً.</b>
      </Notice>
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
            onError: onActionError(setError, onClose),
          },
        )
      }
    >
      <Notice>
        تعود حالته حسب تواريخ اشتراكه الآن: إذا انتهى الاشتراك أثناء الإيقاف يصبح «منتهي» حتى يدفع.
      </Notice>
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
            onError: onActionError(setError, onClose),
          },
        )
      }
    />
  );
}

function RemoveLinkDialog({ merchant, link, onClose }: DialogProps & { link: MerchantLink }) {
  const remove = useRemoveMerchantLink();
  const { field, label } = merchantLinks[link];
  const url = merchant.links[field];

  return (
    <ReasonOnlyDialog
      title={`إزالة رابط ${label}؟`}
      description="لرابط غير لائق أو لا يخص المحل. يختفي من صفحة المحل."
      confirmLabel="إزالة الرابط"
      tone="danger"
      pending={remove.isPending}
      onClose={onClose}
      onConfirm={(reason, setError) =>
        remove.mutate(
          { id: merchant.id, link, reason },
          {
            onSuccess: () => {
              toast.success("تمت إزالة الرابط");
              onClose();
            },
            onError: onActionError(setError, onClose),
          },
        )
      }
    >
      {/* The exact address, so the admin knows which one goes */}
      {url && (
        <Notice>
          <Latin className="block break-all">{url}</Latin>
        </Notice>
      )}
    </ReasonOnlyDialog>
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
            onError: onActionError(setError, onClose),
          },
        )
      }
    >
      <Notice>
        لا تقبل أختاماً جديدة، والهدايا المستحقة لزبائنها ({card.customers_count} زبون) تُسلَّم عادي.
      </Notice>
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
        onError: onActionError(form.setError, onClose),
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
        <Notice tone="warning">
          سُجّل هذا التاجر قبل أكثر من أسبوع ({formatDate(merchant.registered_at)}). تأكّد أن التعديل تصحيح وليس تغييراً
          لهوية النشاط.
        </Notice>
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
        onError: onActionError(form.setError, onClose),
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
    case "delete":
      return <ScheduleMerchantDeletionDialog {...props} />;
    case "cancel-deletion":
      return props.merchant.deletion ? (
        <CancelDeletionDialog requestId={props.merchant.deletion.id} name={props.merchant.business_name} onClose={props.onClose} />
      ) : null;
    case "remove-link":
      return <RemoveLinkDialog {...props} link={action.link} />;
    case "suspend-card":
      return <SuspendCardDialog {...props} card={action.card} />;
    default:
      return null;
  }
}
