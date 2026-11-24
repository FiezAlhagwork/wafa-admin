"use client";

import { useId, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button, ConfirmDialog, Dialog, Field, Input, Notice, Spinner, toast } from "@/components/ui";
import { toastActionError } from "@/lib/api/action-errors";
import { applyFieldErrors } from "@/lib/api/errors";
import type { AdminLookup, UpdateLookupBody } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { usePhosphor, useCreateLookup, useUpdateLookup } from "../hooks";
import { ICON_KEY_PATTERN } from "../icon-key";
import { kindText, type LookupKind } from "../kinds";
import { lookupSchema, type LookupFormValues } from "../schemas";
import type { CreateLookupBody } from "../services";
import { PhosphorIcon } from "./PhosphorIcon";

const NO_ICON = "لا توجد أيقونة بهذا الاسم في Phosphor";

type LookupFormDialogProps = {
  kind: LookupKind;
  /** `"new"` adds one; an entry edits it. */
  target: "new" | AdminLookup;
  onClose: () => void;
};

/** The live preview beside the key field: the icon as merchants will see it, or why there is none. */
function KeyPreview({ iconKey }: { iconKey: string }) {
  const library = usePhosphor();
  const key = iconKey.trim();
  const found = key && library.data ? library.data.iconByKey(key) !== null : false;

  let note: string | null = null;
  if (!key) note = "اكتب الاسم لترى الأيقونة";
  else if (library.isPending) note = null;
  else if (library.isError) note = "تعذّر تحميل المعاينة، ويتحقق الخادم من الاسم عند الحفظ";
  else if (!found) note = ICON_KEY_PATTERN.test(key) ? NO_ICON : null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-neutral-50 p-3">
      <span
        className={cn(
          "flex size-14 shrink-0 items-center justify-center rounded-2xl",
          found ? "bg-amber-soft text-ink" : "border-2 border-dashed border-border-strong text-fg-subtle",
        )}
      >
        {key && library.isPending ? <Spinner size="sm" /> : found && <PhosphorIcon iconKey={key} className="size-7" />}
      </span>
      <p aria-live="polite" className={cn("text-sm", found ? "text-success" : "text-fg-muted")}>
        {found ? "هذه الأيقونة كما ستظهر على البطاقة" : note}
      </p>
    </div>
  );
}

/** Add and edit share one dialog. Mounted only while open, so the fields never carry over to the next entry. */
export function LookupFormDialog({ kind, target, onClose }: LookupFormDialogProps) {
  const item = target === "new" ? null : target;
  const text = kindText[kind];
  const withKey = text.hasKey && !item;
  const formId = useId();
  const [confirming, setConfirming] = useState<"deactivate" | "reactivate" | null>(null);

  const create = useCreateLookup();
  const update = useUpdateLookup();
  const toggle = useUpdateLookup();
  const library = usePhosphor();
  const saving = create.isPending || update.isPending;
  const busy = saving || toggle.isPending;

  const form = useForm<LookupFormValues>({
    resolver: zodResolver(lookupSchema(withKey)),
    defaultValues: { name: item?.name ?? "", key: "", sort_order: item ? String(item.sort_order) : "" },
  });
  const iconKey = useWatch({ control: form.control, name: "key" });
  const errors = form.formState.errors;

  const onSaveError = (error: unknown) => {
    if (!applyFieldErrors(error, form.setError)) toastActionError(error);
  };

  const submit = form.handleSubmit((values) => {
    const sortOrder = values.sort_order === "" ? undefined : Number(values.sort_order);

    if (!item) {
      // The library decides whether the icon exists; if it failed to load, the server checks the key on its own
      if (withKey && library.data && !library.data.iconByKey(values.key)) {
        form.setError("key", { type: "manual", message: NO_ICON });
        return;
      }
      const body: CreateLookupBody = { name: values.name, ...(withKey && { key: values.key }) };
      if (sortOrder !== undefined) body.sort_order = sortOrder;
      create.mutate(
        { kind, ...body },
        {
          onSuccess: (created) => {
            toast.success(text.created, { description: created.is_active ? text.createdDescription : undefined });
            onClose();
          },
          onError: onSaveError,
        },
      );
      return;
    }

    // Only what changed; an emptied order keeps the current one (the API takes no "no order")
    const body: UpdateLookupBody = {};
    if (values.name !== item.name) body.name = values.name;
    if (sortOrder !== undefined && sortOrder !== item.sort_order) body.sort_order = sortOrder;
    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }
    update.mutate(
      { kind, id: item.id, ...body },
      {
        onSuccess: () => {
          toast.success(text.saved);
          onClose();
        },
        onError: onSaveError,
      },
    );
  });

  const setActive = (isActive: boolean) => {
    if (!item) return;
    const done = isActive ? text.reactivate : text.deactivate;
    toggle.mutate(
      { kind, id: item.id, is_active: isActive },
      {
        onSuccess: () => {
          toast.success(done.done, { description: done.doneDescription });
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

  // Adding an icon waits for the library, so the check above has its answer (unless loading it failed)
  const waitingForLibrary = withKey && library.isPending;

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      size="md"
      sheet
      title={item ? text.editTitle(item.name) : text.createTitle}
      description={item ? undefined : text.createDescription}
      dismissible={!busy}
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form={formId} loading={saving} disabled={busy || waitingForLibrary}>
            {item ? "حفظ" : text.add}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-5">
        {text.hasKey &&
          (withKey ? (
            <div className="flex flex-col gap-3">
              <Field
                label="اسم الأيقونة في Phosphor"
                error={errors.key?.message}
                required
                disabled={busy}
                hint={
                  <>
                    ابحث عن الاسم في{" "}
                    <a
                      href="https://phosphoricons.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-brand underline underline-offset-2"
                    >
                      phosphoricons.com
                    </a>
                    . لا يمكن تغييره بعد الإضافة.
                  </>
                }
              >
                <Input dir="ltr" autoComplete="off" spellCheck={false} placeholder="fork-knife" {...form.register("key")} />
              </Field>
              <KeyPreview iconKey={iconKey} />
            </div>
          ) : (
            item?.key && (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-neutral-50 p-3">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-soft text-ink">
                  <PhosphorIcon iconKey={item.key} className="size-7" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-xs text-fg-muted">اسم الأيقونة في Phosphor (لا يتغيّر)</span>
                  <span dir="ltr" className="truncate text-end font-medium text-fg">
                    {item.key}
                  </span>
                </div>
              </div>
            )
          ))}

        <Field label={text.nameLabel} error={errors.name?.message} hint={text.nameHint} required disabled={busy}>
          <Input autoComplete="off" {...form.register("name")} />
        </Field>

        <Field label="ترتيب الظهور" error={errors.sort_order?.message} hint="الأصغر يظهر أولاً في التطبيق." disabled={busy}>
          <Input dir="ltr" inputMode="numeric" autoComplete="off" className="sm:max-w-40" {...form.register("sort_order")} />
        </Field>

        {item?.is_active && (
          <section className="flex flex-col gap-2 rounded-lg border border-border p-3">
            <h3 className="text-sm font-medium text-fg">{text.deactivate.heading}</h3>
            <p className="text-sm text-fg-muted">{text.deactivate.text}</p>
            <Button
              variant="secondary"
              size="sm"
              className="self-start text-danger"
              disabled={busy}
              onClick={() => setConfirming("deactivate")}
            >
              {text.deactivate.button}
            </Button>
          </section>
        )}
        {item && !item.is_active && (
          <section className="flex flex-col gap-2 rounded-lg border border-border bg-neutral-50 p-3">
            <h3 className="text-sm font-medium text-fg">{text.reactivate.heading}</h3>
            <p className="text-sm text-fg-muted">{text.reactivate.text}</p>
            <Button variant="secondary" size="sm" className="self-start" disabled={busy} onClick={() => setConfirming("reactivate")}>
              إعادة التفعيل
            </Button>
          </section>
        )}
        {withKey && library.isError && <Notice>تعذّر تحميل مكتبة الأيقونات، فلا معاينة الآن.</Notice>}
      </form>

      {/* Inside the edit dialog, so focus and Esc go to the confirmation on top of it */}
      <ConfirmDialog
        open={confirming === "deactivate"}
        onOpenChange={(open) => !open && setConfirming(null)}
        tone="danger"
        title={`${text.deactivate.button}؟`}
        description={item ? text.deactivate.confirm(item.name) : undefined}
        confirmLabel={text.deactivate.button}
        loading={toggle.isPending}
        onConfirm={() => setActive(false)}
      />
      <ConfirmDialog
        open={confirming === "reactivate"}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="إعادة التفعيل؟"
        description={item ? text.reactivate.confirm(item.name) : undefined}
        confirmLabel="إعادة التفعيل"
        loading={toggle.isPending}
        onConfirm={() => setActive(true)}
      />
    </Dialog>
  );
}

