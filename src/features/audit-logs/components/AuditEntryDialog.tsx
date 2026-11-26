"use client";

import { useState } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { Button, Dialog, Latin } from "@/components/ui";
import { Row, When } from "@/features/payments/components/PaymentDetailParts";
import type { AuditLogEntry } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { actionLabel, changesOf, fieldLabel, formatValue, subjectHref, subjectName } from "../labels";
import { AuditAction, AuditActor } from "./AuditLogList";

type AuditEntryDialogProps = {
  entry: AuditLogEntry;
  /** Opens the record's page (a merchant or a customer); missing when the record has none. */
  onOpenSubject?: (href: string) => void;
  onClose: () => void;
};

/** One entry: who, when, from where, on what, and every value before and after. Read only; mounted only while open. */
export function AuditEntryDialog({ entry, onOpenSubject, onClose }: AuditEntryDialogProps) {
  const changes = changesOf(entry);
  const href = subjectHref(entry);
  const subject = subjectName(entry);
  const both = !!entry.before && !!entry.after;
  // With both sides, only what changed is shown at first: a whole record (a payment method) repeats every field
  const unchanged = both ? changes.filter((change) => !change.changed).length : 0;
  const [showAll, setShowAll] = useState(false);
  const shown = both && !showAll && unchanged < changes.length ? changes.filter((change) => change.changed) : changes;

  return (
    <Dialog
      open
      sheet
      size="lg"
      onOpenChange={(open) => !open && onClose()}
      title={actionLabel(entry.action)}
      description={subject ?? undefined}
      footer={
        href && onOpenSubject ? (
          <Button variant="secondary" className="max-sm:flex-1" icon={<ArrowSquareOut className="size-4" />} onClick={() => onOpenSubject(href)}>
            فتح صفحة {entry.subject_type === "merchant" ? "التاجر" : "الزبون"}
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <dl className="divide-y divide-border rounded-lg border border-border">
          <Row label="العملية">
            <AuditAction action={entry.action} />
          </Row>
          <Row label="من">
            <AuditActor entry={entry} className="justify-end" />
          </Row>
          <Row label="الوقت">
            <When iso={entry.created_at} />
          </Row>
          <Row label="عنوان IP">{entry.ip_address ? <Latin>{entry.ip_address}</Latin> : "—"}</Row>
        </dl>

        {changes.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[30%]" />
                {both ? (
                  <>
                    <col className="w-[35%]" />
                    <col className="w-[35%]" />
                  </>
                ) : (
                  <col />
                )}
              </colgroup>
              <thead className="bg-neutral-50 text-xs text-fg-muted">
                <tr>
                  <th className="px-3 py-2 text-start font-medium">الحقل</th>
                  {both ? (
                    <>
                      <th className="px-3 py-2 text-start font-medium">قبل</th>
                      <th className="px-3 py-2 text-start font-medium">بعد</th>
                    </>
                  ) : (
                    <th className="px-3 py-2 text-start font-medium">{entry.after ? "القيمة" : "القيمة قبل العملية"}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {shown.map((change) => (
                  <tr key={change.key} className={cn(both && change.changed && showAll && "bg-amber-soft/40")}>
                    <th scope="row" className="px-3 py-2.5 text-start align-top font-medium break-words text-fg-muted">
                      {fieldLabel(change.key) === change.key ? <Latin>{change.key}</Latin> : fieldLabel(change.key)}
                    </th>
                    {both ? (
                      <>
                        <Value field={change.key} value={change.before} muted={change.changed} />
                        <Value field={change.key} value={change.after} strong={change.changed} />
                      </>
                    ) : (
                      <Value field={change.key} value={entry.after ? change.after : change.before} />
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {both && unchanged > 0 && unchanged < changes.length && (
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="w-full cursor-pointer border-t border-divider px-3 py-2 text-start text-sm font-medium text-brand outline-none hover:bg-neutral-50 focus-visible:bg-neutral-50"
              >
                {showAll ? "إخفاء الحقول التي لم تتغيّر" : `عرض الحقول التي لم تتغيّر (${unchanged})`}
              </button>
            )}
          </div>
        ) : (
          <p className="rounded-lg bg-neutral-50 px-3 py-2.5 text-sm text-fg-muted">لا توجد قيم مسجّلة لهذه العملية.</p>
        )}
      </div>
    </Dialog>
  );
}

function Value({ field, value, muted, strong }: { field: string; value: unknown; muted?: boolean; strong?: boolean }) {
  const text = formatValue(field, value);
  const json = typeof value === "object" && value !== null;
  return (
    <td className={cn("px-3 py-2.5 align-top break-words [overflow-wrap:anywhere]", muted ? "text-fg-muted" : "text-fg", strong && "font-bold")}>
      {json ? (
        <pre dir="ltr" className="text-start font-mono text-xs whitespace-pre-wrap">
          {text}
        </pre>
      ) : (
        text
      )}
    </td>
  );
}
