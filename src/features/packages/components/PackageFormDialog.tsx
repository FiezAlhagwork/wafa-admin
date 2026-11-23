"use client";

import { useId, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CurrencyDollar, WarningCircle } from "@phosphor-icons/react";
import { useForm, useWatch, type UseFormSetError } from "react-hook-form";
import { Button, ConfirmDialog, Dialog, Field, Input, Notice, toast } from "@/components/ui";
import { toastActionError } from "@/lib/api/action-errors";
import { toApiError } from "@/lib/api/errors";
import { FALLBACK_FIELD_MESSAGE, fieldRuleMessages } from "@/lib/api/error-messages";
import type { AdminPackage, PackageDuration } from "@/lib/api/types";
import { useCreatePackage, useUpdatePackage } from "../hooks";
import { pendingChanges, priceText, toCreateBody, toUpdateBody } from "../body";
import { durationLabels, durations } from "../labels";
import { packageSchema, priceField, type PackageFormValues } from "../schemas";

/**
 * Puts the server's 422 next to the right field. `prices.N.price_usd` points at the N-th price *sent*, so it is mapped
 * back to its duration through the body that was sent. Returns false when there was nothing to show (not a 422).
 */
function applyPackageErrors(
  error: unknown,
  setError: UseFormSetError<PackageFormValues>,
  sentPrices: { duration_months: PackageDuration }[] | undefined,
): boolean {
  const { code, details } = toApiError(error);
  const fields = details.fields;
  if (code !== "VALIDATION_FAILED" || typeof fields !== "object" || fields === null) return false;

  const own = new Set<string>(["name", "cards_limit", "weekly_campaigns_limit", "sort_order"]);
  for (const [name, rules] of Object.entries(fields)) {
    const rule: unknown = Array.isArray(rules) ? rules[0] : undefined;
    const message = (typeof rule === "string" && fieldRuleMessages[rule]) || FALLBACK_FIELD_MESSAGE;
    const price = /^prices\.(\d+)/.exec(name);
    const months = price ? sentPrices?.[Number(price[1])]?.duration_months : undefined;
    if (months) setError(priceField(months), { type: "server", message });
    else if (own.has(name)) setError(name as keyof PackageFormValues, { type: "server", message });
    else setError("root", { type: "server", message: name.startsWith("prices") ? "تحقّق من الأسعار" : message });
  }
  return true;
}

type PackageFormDialogProps = {
  /** `"new"` adds a package; a package edits it. */
  target: "new" | AdminPackage;
  onClose: () => void;
};

/** Add and edit share one dialog. Mounted only while open, so the fields never carry over to the next package. */
export function PackageFormDialog({ target, onClose }: PackageFormDialogProps) {
  const pkg = target === "new" ? null : target;
  const formId = useId();
  const [confirming, setConfirming] = useState<"deactivate" | "reactivate" | null>(null);

  const create = useCreatePackage();
  const update = useUpdatePackage();
  const toggle = useUpdatePackage();
  const saving = create.isPending || update.isPending;
  const busy = saving || toggle.isPending;

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: pkg?.name ?? "",
      cards_limit: pkg ? String(pkg.cards_limit) : "",
      weekly_campaigns_limit: pkg ? String(pkg.weekly_campaigns_limit) : "",
      sort_order: pkg ? String(pkg.sort_order) : "",
      price_1: priceText(pkg, 1),
      price_3: priceText(pkg, 3),
      price_12: priceText(pkg, 12),
    },
  });
  const values = useWatch({ control: form.control });
  const changes = pkg ? pendingChanges(pkg, { ...form.getValues(), ...values } as PackageFormValues) : null;

  const submit = form.handleSubmit((formValues) => {
    if (!pkg) {
      const body = toCreateBody(formValues);
      create.mutate(body, {
        onSuccess: (created) => {
          toast.success("تمت إضافة الباقة", {
            description: created.is_active ? "تظهر الآن للتجار في التطبيق." : undefined,
          });
          onClose();
        },
        onError: (error) => {
          if (!applyPackageErrors(error, form.setError, body.prices)) toastActionError(error);
        },
      });
      return;
    }

    const body = toUpdateBody(pkg, formValues);
    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }
    update.mutate(
      { id: pkg.id, ...body },
      {
        onSuccess: () => {
          toast.success("تم حفظ الباقة");
          onClose();
        },
        onError: (error) => {
          if (!applyPackageErrors(error, form.setError, body.prices)) toastActionError(error);
        },
      },
    );
  });

  const setActive = (isActive: boolean) => {
    if (!pkg) return;
    toggle.mutate(
      { id: pkg.id, is_active: isActive },
      {
        onSuccess: () => {
          toast.success(isActive ? "تمت إعادة تفعيل الباقة" : "تم تعطيل الباقة", {
            description: isActive ? "تظهر من جديد للتجار في التطبيق." : "لم تعد تظهر للاشتراكات الجديدة.",
          });
          setConfirming(null);
          onClose();
        },
        onError: (error) => {
          toastActionError(error);
          setConfirming(null);
        },
      },
    );
  };

  const errors = form.formState.errors;

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      size="md"
      sheet
      title={pkg ? `تعديل باقة ${pkg.name}` : "إضافة باقة"}
      description={pkg ? undefined : "تظهر الباقة الفعّالة للتجار في التطبيق فور إضافتها."}
      dismissible={!busy}
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form={formId} loading={saving} disabled={busy}>
            {pkg ? "حفظ" : "إضافة الباقة"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-5">
        <Field label="اسم الباقة" error={errors.name?.message} required disabled={busy}>
          <Input autoComplete="off" {...form.register("name")} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="عدد البطاقات" error={errors.cards_limit?.message} hint="من 1 إلى 20" required disabled={busy}>
            <Input dir="ltr" inputMode="numeric" autoComplete="off" {...form.register("cards_limit")} />
          </Field>
          <Field
            label="الحملات الأسبوعية"
            error={errors.weekly_campaigns_limit?.message}
            hint="0 يعني بدون حملات"
            required
            disabled={busy}
          >
            <Input dir="ltr" inputMode="numeric" autoComplete="off" {...form.register("weekly_campaigns_limit")} />
          </Field>
        </div>

        <Field label="ترتيب الظهور" error={errors.sort_order?.message} hint="الأصغر يظهر أولاً في التطبيق." disabled={busy}>
          <Input dir="ltr" inputMode="numeric" autoComplete="off" className="sm:max-w-40" {...form.register("sort_order")} />
        </Field>

        <fieldset className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <legend className="px-1 text-sm font-bold text-fg">الأسعار بالدولار</legend>
          <p className="-mt-1 text-sm text-fg-muted">اترك المدة فارغة إذا لا تريد بيعها بهذه الباقة.</p>
          {errors.root?.message && (
            <p role="alert" className="flex items-center gap-1 text-sm text-danger">
              <WarningCircle aria-hidden className="size-4 shrink-0" weight="fill" />
              {errors.root.message}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            {durations.map((months) => (
              <Field
                key={months}
                label={durationLabels[months]}
                error={errors[priceField(months)]?.message}
                disabled={busy}
              >
                <Input
                  dir="ltr"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="—"
                  startIcon={<CurrencyDollar />}
                  {...form.register(priceField(months))}
                />
              </Field>
            ))}
          </div>
        </fieldset>

        {changes?.limits && (
          <Notice tone="warning">تغيير الحدود يطبَّق فوراً على كل التجار المشتركين بهذه الباقة.</Notice>
        )}
        {changes?.prices && <Notice>السعر الجديد يطبَّق على الدفعات القادمة فقط، والدفعات المرسلة تبقى بسعرها.</Notice>}

        {pkg?.is_active && (
          <section className="flex flex-col gap-2 rounded-lg border border-border p-3">
            <h3 className="text-sm font-medium text-fg">تعطيل الباقة</h3>
            <p className="text-sm text-fg-muted">
              تختفي من التطبيق فلا يشترك بها أحد جديد، ويبقى المشتركون الحاليون عليها. لا تُحذف الباقات.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="self-start text-danger"
              disabled={busy}
              onClick={() => setConfirming("deactivate")}
            >
              تعطيل الباقة
            </Button>
          </section>
        )}
        {pkg && !pkg.is_active && (
          <section className="flex flex-col gap-2 rounded-lg border border-border bg-neutral-50 p-3">
            <h3 className="text-sm font-medium text-fg">الباقة معطّلة</h3>
            <p className="text-sm text-fg-muted">لا تظهر للتجار في التطبيق حتى تُعيد تفعيلها.</p>
            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              disabled={busy}
              onClick={() => setConfirming("reactivate")}
            >
              إعادة التفعيل
            </Button>
          </section>
        )}
      </form>

      {/* Inside the edit dialog, so focus and Esc go to the confirmation on top of it */}
      <ConfirmDialog
        open={confirming === "deactivate"}
        onOpenChange={(open) => !open && setConfirming(null)}
        tone="danger"
        title="تعطيل هذه الباقة؟"
        description={pkg ? `«${pkg.name}» لن تظهر للاشتراكات الجديدة. المشتركون الحاليون يبقون عليها.` : undefined}
        confirmLabel="تعطيل الباقة"
        loading={toggle.isPending}
        onConfirm={() => setActive(false)}
      />
      <ConfirmDialog
        open={confirming === "reactivate"}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="إعادة تفعيل هذه الباقة؟"
        description={pkg ? `«${pkg.name}» ستظهر من جديد للتجار في التطبيق بأسعارها الحالية.` : undefined}
        confirmLabel="إعادة التفعيل"
        loading={toggle.isPending}
        onConfirm={() => setActive(true)}
      />
    </Dialog>
  );
}
