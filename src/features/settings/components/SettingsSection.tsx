"use client";

import { createElement, useId, type KeyboardEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowSquareOut, PencilSimple } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { Button, Card, CardHeader, Field, Input, Notice, Skeleton, Textarea, toast } from "@/components/ui";
import { toastActionError } from "@/lib/api/action-errors";
import { applyFieldErrors } from "@/lib/api/errors";
import type { UpdateAppSettingsBody, UpdateBillingSettingsBody } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatSyp } from "@/lib/format";
import { changedBody, sectionSchema, toFormValues, type SectionValues } from "../form";
import { useUpdateAppSettings, useUpdateBillingSettings } from "../hooks";
import type { SettingField, SettingsSection as Section } from "../sections";

type StoredSettings = Record<string, string | number>;

const fieldsOf = (section: Section) => Object.entries(section.fields) as [string, SettingField][];

type SettingsSectionProps = {
  section: Section;
  stored: StoredSettings;
  editing: boolean;
  /** Another section is open: one at a time, so nothing unsaved is lost. */
  locked: boolean;
  onEdit: () => void;
  onDone: () => void;
};

/** One group of settings: its values, and the same card turned into a form while editing. */
export function SettingsSection({ section, stored, editing, locked, onEdit, onDone }: SettingsSectionProps) {
  return (
    <Card className={cn(editing && "ring-2 ring-brand/15")}>
      <CardHeader
        title={section.title}
        description={section.description}
        icon={createElement(section.icon)}
        iconTone={section.iconTone}
        actions={
          !editing && (
            <Button
              variant="primary"
              size="sm"
              icon={<PencilSimple className="size-4" />}
              disabled={locked}
              onClick={onEdit}
              aria-label={`تعديل ${section.title}`}
            >
              تعديل
            </Button>
          )
        }
      />
      {editing ? (
        <SectionForm section={section} stored={stored} onDone={onDone} />
      ) : (
        <dl className="flex flex-col divide-y divide-divider px-5">
          {fieldsOf(section).map(([name, field]) => (
            <div key={name} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <dt className="shrink-0 text-sm text-fg-muted">{field.label}</dt>
              <dd className="min-w-0 text-sm font-medium text-fg sm:text-end">
                <SettingValue field={field} value={stored[name]} />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}

function SettingValue({ field, value }: { field: SettingField; value: string | number | undefined }) {
  const text = value === undefined ? "" : String(value);
  switch (field.kind) {
    case "int":
      return <>{field.show(Number(value))}</>;
    case "money":
      return (
        <span className="flex items-baseline gap-1.5 sm:justify-end">
          <span className="text-2xl font-black text-fg">{formatSyp(text)}</span>
          <span className="text-xs font-normal text-fg-muted">للدولار</span>
        </span>
      );
    case "version":
      return text ? <span dir="ltr">{text}</span> : <span className="font-normal text-fg-muted">لا يوجد حد أدنى</span>;
    case "url":
      return text ? (
        <a
          href={text}
          target="_blank"
          rel="noreferrer"
          dir="ltr"
          className="inline-flex max-w-full items-center gap-1 rounded-sm text-brand underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
        >
          <span className="min-w-0 truncate">{text}</span>
          <ArrowSquareOut aria-hidden className="size-4 shrink-0" />
        </a>
      ) : (
        <span className="font-normal text-fg-muted">غير محدد</span>
      );
    default:
      if (!text) return <span className="font-normal text-fg-muted">غير محدد</span>;
      return (
        <span dir={field.ltr ? "ltr" : undefined} className="whitespace-pre-line break-words">
          {text}
        </span>
      );
  }
}

/** Mounted only while editing, so each edit starts from the stored values. */
function SectionForm({ section, stored, onDone }: { section: Section; stored: StoredSettings; onDone: () => void }) {
  const formId = useId();
  const billing = useUpdateBillingSettings();
  const app = useUpdateAppSettings();
  const saving = billing.isPending || app.isPending;

  const form = useForm<SectionValues>({
    resolver: zodResolver(sectionSchema(section)),
    defaultValues: toFormValues(section, stored),
  });

  const submit = form.handleSubmit((values) => {
    const body = changedBody(section, stored, values);
    if (Object.keys(body).length === 0) {
      onDone();
      return;
    }
    const callbacks = {
      onSuccess: () => {
        toast.success("تم حفظ الإعدادات", { description: section.title });
        onDone();
      },
      onError: (error: unknown) => {
        if (!applyFieldErrors(error, form.setError)) toastActionError(error);
      },
    };
    if (section.source === "billing") billing.mutate(body as UpdateBillingSettingsBody, callbacks);
    else app.mutate(body as UpdateAppSettingsBody, callbacks);
  });

  const cancelOnEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape" && !saving) onDone();
  };

  const errors = form.formState.errors;

  return (
    <form id={formId} onSubmit={submit} onKeyDown={cancelOnEscape} noValidate className="flex flex-col gap-4 p-5">
      {fieldsOf(section).map(([name, field], index) => {
        const common = { autoFocus: index === 0, autoComplete: "off", ...form.register(name) };
        return (
          <Field key={name} label={field.label} hint={field.hint} error={errors[name]?.message} required={field.kind !== "version"} disabled={saving}>
            {field.kind === "textarea" ? (
              <Textarea rows={3} {...common} />
            ) : (
              <Input
                dir={field.kind === "text" && !field.ltr ? undefined : "ltr"}
                inputMode={field.kind === "int" ? "numeric" : field.kind === "money" ? "decimal" : field.kind === "url" ? "url" : undefined}
                className={cn((field.kind === "int" || field.kind === "money" || field.kind === "version") && "sm:max-w-48")}
                {...common}
              />
            )}
          </Field>
        );
      })}

      <Notice tone={section.noteTone}>{section.note}</Notice>

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

export function SettingsSectionSkeleton({ rows }: { rows: number }) {
  return (
    <Card aria-hidden>
      <div className="flex items-center gap-3 border-b border-divider px-5 py-4">
        <Skeleton className="size-9 rounded-xl" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="flex flex-col divide-y divide-divider px-5">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center justify-between py-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </Card>
  );
}
