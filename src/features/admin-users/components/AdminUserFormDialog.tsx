"use client";

import { useId, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { WarningCircle } from "@phosphor-icons/react";
import { Controller, useForm } from "react-hook-form";
import { Button, ConfirmDialog, Dialog, Field, Input, RadioGroup, toast } from "@/components/ui";
import { toastActionError } from "@/lib/api/action-errors";
import { applyFieldErrors, toApiError } from "@/lib/api/errors";
import type { AdminUser, UpdateAdminUserBody } from "@/lib/api/types";
import { useAdmin } from "@/lib/auth/admin-provider";
import { useCreateAdminUser, useDeactivateAdminUser, useUpdateAdminUser } from "../hooks";
import { roleOptions } from "../labels";
import { adminUserSchema, type AdminUserFormValues } from "../schemas";

/** The server refuses a change of the signed-in account's own role or activation with `fields.admin_user`. */
const touchesOwnAccount = (error: unknown) => {
  const { fields } = toApiError(error).details;
  return typeof fields === "object" && fields !== null && "admin_user" in fields;
};

type AdminUserFormDialogProps = {
  /** `"new"` adds an account; an account edits it. */
  target: "new" | AdminUser;
  onClose: () => void;
};

/** Add and edit share one dialog. Mounted only while open, so the fields never carry over to the next account. */
export function AdminUserFormDialog({ target, onClose }: AdminUserFormDialogProps) {
  const user = target === "new" ? null : target;
  const { user: signedIn } = useAdmin();
  const isSelf = user !== null && user.id === signedIn.id;
  const formId = useId();
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
  const [confirmingReactivate, setConfirmingReactivate] = useState(false);

  const create = useCreateAdminUser();
  const update = useUpdateAdminUser();
  const reactivate = useUpdateAdminUser();
  const deactivate = useDeactivateAdminUser();
  const saving = create.isPending || update.isPending;
  const busy = saving || reactivate.isPending || deactivate.isPending;

  const form = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "", role: user?.role },
  });

  const onError = (error: unknown) => {
    if (touchesOwnAccount(error)) {
      toast.error("لا يمكنك تغيير دور حسابك أو تعطيله");
      return;
    }
    if (!applyFieldErrors(error, form.setError)) toastActionError(error);
  };

  const submit = form.handleSubmit((values) => {
    if (!user) {
      create.mutate(values, {
        onSuccess: () => {
          toast.success("تمت إضافة الحساب", {
            description: "يرتبط تلقائياً عندما يدخل صاحب البريد إلى اللوحة بنفس هذا البريد.",
          });
          onClose();
        },
        onError,
      });
      return;
    }

    // Only what changed: the server refuses `email` once the account is linked, even with the same value
    const changes: UpdateAdminUserBody = {};
    if (values.name !== user.name) changes.name = values.name;
    if (values.role !== user.role) changes.role = values.role;
    if (!user.linked && values.email !== user.email) changes.email = values.email;
    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    update.mutate(
      { id: user.id, ...changes },
      {
        onSuccess: () => {
          toast.success("تم حفظ التعديلات");
          onClose();
        },
        onError,
      },
    );
  });

  const confirmDeactivate = () => {
    if (!user) return;
    deactivate.mutate(user.id, {
      onSuccess: () => {
        toast.success("تم تعطيل الحساب", { description: "لن يتمكن من الدخول إلى اللوحة." });
        setConfirmingDeactivate(false);
        onClose();
      },
      onError: (error) => {
        toastActionError(error);
        setConfirmingDeactivate(false);
      },
    });
  };

  const reactivateAccount = () => {
    if (!user) return;
    reactivate.mutate(
      { id: user.id, is_active: true },
      {
        onSuccess: () => {
          toast.success("تمت إعادة تفعيل الحساب");
          setConfirmingReactivate(false);
          onClose();
        },
        onError: (error) => {
          toastActionError(error);
          setConfirmingReactivate(false);
        },
      },
    );
  };

  const errors = form.formState.errors;

  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => !open && onClose()}
        size="md"
        sheet
        title={user ? "تعديل الحساب" : "إضافة حساب إدارة"}
        description={
          user
            ? undefined
            : "اكتب بريد الشخص كما سيدخل به إلى اللوحة. يرتبط الحساب تلقائياً عند أول دخول."
        }
        dismissible={!busy}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" form={formId} loading={saving} disabled={busy}>
              {user ? "حفظ" : "إضافة الحساب"}
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Field label="الاسم" error={errors.name?.message} required disabled={busy}>
            <Input autoComplete="off" {...form.register("name")} />
          </Field>

          <Field
            label="البريد الإلكتروني"
            error={errors.email?.message}
            required
            disabled={busy || user?.linked}
            hint={user?.linked ? "الحساب مرتبط بهذا البريد ولا يمكن تغييره." : undefined}
          >
            <Input dir="ltr" inputMode="email" autoComplete="off" {...form.register("email")} />
          </Field>

          <Controller
            control={form.control}
            name="role"
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-fg">
                  الدور
                  <span className="ms-0.5 text-danger" aria-hidden>
                    *
                  </span>
                </span>
                <RadioGroup
                  label="الدور"
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                  options={roleOptions}
                  disabled={busy || isSelf}
                />
                {isSelf && <p className="text-sm text-fg-muted">لا يمكنك تغيير دور حسابك. اطلب ذلك من مدير عام آخر.</p>}
                {fieldState.error && (
                  <p className="flex items-center gap-1 text-sm text-danger">
                    <WarningCircle aria-hidden className="size-4 shrink-0" weight="fill" />
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          {user && user.is_active && (
            <section className="flex flex-col gap-2 rounded-lg border border-border p-3">
              <h3 className="text-sm font-medium text-fg">تعطيل الحساب</h3>
              <p className="text-sm text-fg-muted">
                {isSelf
                  ? "لا يمكنك تعطيل حسابك."
                  : "لن يتمكن من الدخول إلى اللوحة، ويبقى سجل التدقيق يدل على ما فعله. يمكن إعادة تفعيله لاحقاً."}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="self-start text-danger"
                disabled={busy || isSelf}
                onClick={() => setConfirmingDeactivate(true)}
              >
                تعطيل الحساب
              </Button>
            </section>
          )}

          {user && !user.is_active && (
            <section className="flex flex-col gap-2 rounded-lg border border-border bg-neutral-50 p-3">
              <h3 className="text-sm font-medium text-fg">الحساب معطّل</h3>
              <p className="text-sm text-fg-muted">لا يستطيع الدخول إلى اللوحة حتى تُعيد تفعيله.</p>
              <Button
                variant="secondary"
                size="sm"
                className="self-start"
                disabled={busy}
                onClick={() => setConfirmingReactivate(true)}
              >
                إعادة التفعيل
              </Button>
            </section>
          )}
        </form>

        {/* Inside the edit dialog, so focus and Esc go to the confirmation on top of it */}
        <ConfirmDialog
          open={confirmingDeactivate}
          onOpenChange={setConfirmingDeactivate}
          tone="danger"
          title="تعطيل هذا الحساب؟"
          description={user ? `${user.name} لن يتمكن من الدخول إلى اللوحة. يمكنك إعادة تفعيله لاحقاً.` : undefined}
          confirmLabel="تعطيل الحساب"
          loading={deactivate.isPending}
          onConfirm={confirmDeactivate}
        />
        <ConfirmDialog
          open={confirmingReactivate}
          onOpenChange={setConfirmingReactivate}
          title="إعادة تفعيل هذا الحساب؟"
          description={user ? `${user.name} سيتمكن من الدخول إلى اللوحة من جديد بدوره الحالي.` : undefined}
          confirmLabel="إعادة التفعيل"
          loading={reactivate.isPending}
          onConfirm={reactivateAccount}
        />
      </Dialog>
    </>
  );
}
