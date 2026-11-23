"use client";

import { createElement, useId, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilSimple, QrCode, Wallet } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  CopyValue,
  Field,
  Input,
  Spinner,
  Switch,
  Textarea,
  toast,
} from "@/components/ui";
import { MethodIcon } from "@/features/payments/components/PaymentParts";
import { toastActionError } from "@/lib/api/action-errors";
import { applyFieldErrors, toApiError } from "@/lib/api/errors";
import type { AdminPaymentAccount, PaymentMethod } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { useRemovePaymentMethodQr, useUpdatePaymentMethod, useUploadPaymentMethodQr } from "../hooks";
import {
  methodBody,
  methodFields,
  methodSchema,
  QR_MAX_BYTES,
  QR_RULE,
  QR_TYPES,
  toMethodValues,
  type MethodValues,
} from "../payment-methods";

type PaymentMethodsCardProps = {
  methods: AdminPaymentAccount[];
  /** The method being edited here, if any. */
  editing: PaymentMethod | null;
  /** Another card or method is open: one edit at a time on the page. */
  locked: boolean;
  onEdit: (method: PaymentMethod) => void;
  onDone: () => void;
};

/** The ways a merchant can pay from the app, in the order the app shows them. Each is switched and edited on its own. */
export function PaymentMethodsCard({ methods, editing, locked, onEdit, onDone }: PaymentMethodsCardProps) {
  const sorted = [...methods].sort((a, b) => a.sort_order - b.sort_order);
  const activeCount = methods.filter((item) => item.is_active).length;

  return (
    <Card>
      <CardHeader
        title="طرق الدفع"
        description="ما يختاره التاجر عند الدفع في التطبيق، بهذا الترتيب."
        icon={<Wallet />}
        iconTone="amber"
      />
      {sorted.length === 0 ? (
        <p className="px-5 py-6 text-sm text-fg-muted">لا توجد طرق دفع.</p>
      ) : (
        <ul className="flex flex-col gap-3 p-4">
          {sorted.map((account) => (
            <MethodRow
              key={account.key}
              account={account}
              isLastActive={account.is_active && activeCount === 1}
              editing={editing === account.key}
              locked={locked || (editing !== null && editing !== account.key)}
              onEdit={() => onEdit(account.key)}
              onDone={onDone}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}

type MethodRowProps = {
  account: AdminPaymentAccount;
  isLastActive: boolean;
  editing: boolean;
  locked: boolean;
  onEdit: () => void;
  onDone: () => void;
};

function MethodRow({ account, isLastActive, editing, locked, onEdit, onDone }: MethodRowProps) {
  const fields = methodFields[account.key];
  const toggle = useUpdatePaymentMethod();
  const [confirmingOff, setConfirmingOff] = useState(false);
  const canActivate = Boolean(account.account);

  const setActive = (isActive: boolean) => {
    toggle.mutate(
      { method: account.key, is_active: isActive },
      {
        onSuccess: () => {
          toast.success(isActive ? `تم تفعيل ${account.name}` : `تم إيقاف ${account.name}`, {
            description: isActive ? "تظهر الآن للتجار عند الدفع." : "لم تعد تظهر للتجار عند الدفع.",
          });
          setConfirmingOff(false);
        },
        onError: (error) => {
          toastActionError(error);
          setConfirmingOff(false);
        },
      },
    );
  };

  return (
    <li className={cn("rounded-xl border border-border", !account.is_active && "bg-neutral-50", editing && "border-brand/40")}>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-fg ring-1 ring-border [&>svg]:size-5"
        >
          {createElement(MethodIcon[account.key])}
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h3 className="text-sm font-bold text-fg">{account.name}</h3>
          <Badge tone={account.is_active ? "success" : "neutral"} dot>
            {account.is_active ? "فعّالة" : "موقوفة"}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {!editing && (
            <Button
              variant="primary"
              size="sm"
              icon={<PencilSimple className="size-4" />}
              disabled={locked}
              onClick={onEdit}
              aria-label={`تعديل ${account.name}`}
            >
              تعديل
            </Button>
          )}
          <Switch
            checked={account.is_active}
            loading={toggle.isPending}
            disabled={!account.is_active && !canActivate}
            label={account.is_active ? `إيقاف ${account.name}` : `تفعيل ${account.name}`}
            onCheckedChange={(next) => (next ? setActive(true) : setConfirmingOff(true))}
          />
        </div>
        {!account.is_active && !canActivate && (
          <p className="basis-full text-xs text-fg-muted">أضف {fields.accountLabel} أولاً لتتمكن من تفعيلها.</p>
        )}
      </div>

      {editing ? (
        <MethodForm account={account} onDone={onDone} />
      ) : (
        <div className="flex flex-col gap-4 border-t border-divider px-4 py-3 sm:flex-row sm:items-start">
          <dl className="flex min-w-0 flex-1 flex-col gap-2.5 text-sm">
            <Detail label={fields.accountLabel}>
              {account.account ? <CopyValue value={account.account} label={`نسخ ${fields.accountLabel}`} /> : null}
            </Detail>
            {fields.recipient && <Detail label="اسم المستلم">{account.recipient_name}</Detail>}
            <Detail label="ملاحظة للتاجر">
              {account.note && <span className="whitespace-pre-line break-words">{account.note}</span>}
            </Detail>
          </dl>
          {fields.qr && <QrImage account={account} />}
        </div>
      )}

      <ConfirmDialog
        open={confirmingOff}
        onOpenChange={setConfirmingOff}
        tone="danger"
        title={`إيقاف ${account.name}؟`}
        description={
          isLastActive
            ? "هذه آخر طريقة دفع فعّالة: لن يتمكن أي تاجر من الدفع حتى تفعّل طريقة أخرى."
            : "لن تظهر للتجار عند الدفع. الدفعات المرسلة بها تبقى كما هي."
        }
        confirmLabel="إيقاف"
        loading={toggle.isPending}
        onConfirm={() => setActive(false)}
      />
    </li>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <dt className="shrink-0 text-fg-muted sm:w-28">{label}</dt>
      <dd className="min-w-0 font-medium text-fg">{children || <span className="font-normal text-fg-muted">غير محدد</span>}</dd>
    </div>
  );
}

/** The QR picture: uploaded or removed at once (not with Save), checked for type and size before it is sent. */
function QrImage({ account }: { account: AdminPaymentAccount }) {
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadPaymentMethodQr();
  const remove = useRemovePaymentMethodQr();
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const busy = upload.isPending || remove.isPending;

  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // the same file can be picked again after an error
    if (!file) return;
    if (!QR_TYPES.includes(file.type) || file.size > QR_MAX_BYTES) {
      toast.error(QR_RULE);
      return;
    }
    upload.mutate(
      { method: account.key, file },
      {
        onSuccess: () => toast.success("تم رفع صورة QR"),
        onError: (error) => {
          const fields = toApiError(error).details.fields;
          if (typeof fields === "object" && fields !== null && "qr" in fields) toast.error(QR_RULE);
          else toastActionError(error);
        },
      },
    );
  };

  const confirmRemove = () =>
    remove.mutate(account.key, {
      onSuccess: () => {
        toast.success("تمت إزالة صورة QR");
        setConfirmingRemove(false);
      },
      onError: (error) => {
        toastActionError(error);
        setConfirmingRemove(false);
      },
    });

  return (
    <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-center">
      <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
        {account.qr_url ? (
          <a
            href={account.qr_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`فتح صورة QR لـ ${account.name}`}
            className="absolute inset-0 outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <Image src={account.qr_url} alt="" fill unoptimized className="object-contain p-1" />
          </a>
        ) : (
          <QrCode aria-hidden className="size-8 text-fg-subtle" />
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-surface/80">
            <Spinner label="جارٍ الحفظ" className="text-brand" />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <input ref={input} type="file" accept={QR_TYPES.join(",")} className="hidden" onChange={pick} />
        <Button variant="secondary" size="sm" disabled={busy} onClick={() => input.current?.click()}>
          {account.qr_url ? "تغيير الصورة" : "رفع صورة QR"}
        </Button>
        {account.qr_url && (
          <Button variant="ghost" size="sm" className="text-danger" disabled={busy} onClick={() => setConfirmingRemove(true)}>
            إزالة
          </Button>
        )}
      </div>
      <ConfirmDialog
        open={confirmingRemove}
        onOpenChange={setConfirmingRemove}
        tone="danger"
        title="إزالة صورة QR؟"
        description={`لن تظهر صورة الرمز للتجار عند الدفع بـ${account.name}، ويبقى ${methodFields[account.key].accountLabel} ظاهراً.`}
        confirmLabel="إزالة"
        loading={remove.isPending}
        onConfirm={confirmRemove}
      />
    </div>
  );
}

/** Mounted only while editing, so each edit starts from the stored values. */
function MethodForm({ account, onDone }: { account: AdminPaymentAccount; onDone: () => void }) {
  const formId = useId();
  const fields = methodFields[account.key];
  const update = useUpdatePaymentMethod();
  const form = useForm<MethodValues>({
    resolver: zodResolver(methodSchema(account)),
    defaultValues: toMethodValues(account),
  });

  const submit = form.handleSubmit((values) => {
    const body = methodBody(account, values);
    if (Object.keys(body).length === 0) {
      onDone();
      return;
    }
    update.mutate(
      { method: account.key, ...body },
      {
        onSuccess: () => {
          toast.success("تم حفظ طريقة الدفع", { description: account.name });
          onDone();
        },
        onError: (error) => {
          if (!applyFieldErrors(error, form.setError)) toastActionError(error);
        },
      },
    );
  });

  const cancelOnEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape" && !update.isPending) onDone();
  };

  const errors = form.formState.errors;
  const saving = update.isPending;

  return (
    <form
      id={formId}
      onSubmit={submit}
      onKeyDown={cancelOnEscape}
      noValidate
      className="flex flex-col gap-4 border-t border-divider px-4 py-4"
    >
      <Field
        label={fields.accountLabel}
        error={errors.account?.message}
        hint={account.is_active ? "مطلوب ما دامت الطريقة فعّالة." : "اتركه فارغاً لمسحه."}
        disabled={saving}
      >
        <Input dir="ltr" autoFocus autoComplete="off" {...form.register("account")} />
      </Field>
      {fields.recipient && (
        <Field label="اسم المستلم" error={errors.recipient_name?.message} disabled={saving}>
          <Input autoComplete="off" {...form.register("recipient_name")} />
        </Field>
      )}
      <Field
        label="ملاحظة للتاجر"
        error={errors.note?.message}
        hint="تعليمات قصيرة تظهر مع الطريقة، مثل «اكتب رقم الحوالة في المرجع». حتى 500 حرف."
        disabled={saving}
      >
        <Textarea rows={2} {...form.register("note")} />
      </Field>
      <Field label="ترتيب الظهور" error={errors.sort_order?.message} hint="الأصغر يظهر أولاً." required disabled={saving}>
        <Input dir="ltr" inputMode="numeric" autoComplete="off" className="sm:max-w-32" {...form.register("sort_order")} />
      </Field>

      <div className="flex justify-end gap-2 border-t border-divider pt-4">
        <Button variant="secondary" disabled={saving} onClick={onDone}>
          إلغاء
        </Button>
        <Button type="submit" form={formId} loading={saving}>
          حفظ
        </Button>
      </div>
    </form>
  );
}
