"use client";

import { CaretLeft, CaretRight, Robot } from "@phosphor-icons/react";
import {
  Avatar,
  Badge,
  Latin,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableSkeletonRows,
} from "@/components/ui";
import type { AuditLogEntry } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatDate, formatRelativeDays, formatTime } from "@/lib/format";
import { actionLabel, actionTone, changeSummary, subjectName } from "../labels";

type ListProps = { entries: AuditLogEntry[]; onOpen: (entry: AuditLogEntry) => void };

/** Who did it: the admin's face and name, or "النظام" for what the server did by itself (a Clerk webhook). */
export function AuditActor({ entry, className }: { entry: AuditLogEntry; className?: string }) {
  if (!entry.admin) {
    return (
      <span className={cn("flex min-w-0 items-center gap-3", className)}>
        <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
          <Robot className="size-4.5" />
        </span>
        <span className="font-bold text-fg">النظام</span>
      </span>
    );
  }
  return (
    <span className={cn("flex min-w-0 items-center gap-3", className)}>
      <Avatar name={entry.admin.name} seed={entry.admin.id} size="sm" />
      <span className="truncate font-bold text-fg">{entry.admin.name}</span>
    </span>
  );
}

/** The action as a colored badge; an action the dashboard does not know yet shows its code. */
export function AuditAction({ action }: { action: string }) {
  const label = actionLabel(action);
  return (
    <Badge tone={actionTone(action)}>{label === action ? <Latin className="font-bold">{action}</Latin> : label}</Badge>
  );
}

const When = ({ iso }: { iso: string }) => (
  <span className="flex flex-col whitespace-nowrap">
    <span className="text-fg">{formatDate(iso)}</span>
    <span className="text-xs text-fg-muted">
      {formatTime(iso)} · {formatRelativeDays(iso)}
    </span>
  </span>
);

const COLUMNS = 6;
const cell = "px-3";

function Head() {
  return (
    <TableHead>
      <tr>
        <TableHeaderCell className={cell}>من</TableHeaderCell>
        <TableHeaderCell className={cell}>العملية</TableHeaderCell>
        <TableHeaderCell className={cell}>على</TableHeaderCell>
        <TableHeaderCell className={cell}>التغيير</TableHeaderCell>
        <TableHeaderCell className={cell}>الوقت</TableHeaderCell>
        <TableHeaderCell className={cell}>
          <span className="sr-only">فتح</span>
        </TableHeaderCell>
      </tr>
    </TableHead>
  );
}

export function AuditLogTable({ entries, onOpen }: ListProps) {
  return (
    <Table>
      <Head />
      <TableBody>
        {entries.map((entry) => {
          const summary = changeSummary(entry);
          return (
            <TableRow
              key={entry.id}
              className="relative cursor-pointer has-focus-visible:bg-neutral-50 has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-focus"
            >
              <TableCell className={cell}>
                <AuditActor entry={entry} className="max-w-48" />
              </TableCell>
              <TableCell className={cell}>
                <AuditAction action={entry.action} />
              </TableCell>
              <TableCell className={cn(cell, "whitespace-nowrap")}>{subjectName(entry) ?? <span className="text-fg-muted">—</span>}</TableCell>
              <TableCell className={cn(cell, "max-w-72")}>
                {summary ? (
                  <span className="line-clamp-2 text-sm text-fg-muted" title={summary}>
                    {summary}
                  </span>
                ) : (
                  <span className="text-fg-muted">—</span>
                )}
              </TableCell>
              <TableCell className={cell}>
                <When iso={entry.created_at} />
              </TableCell>
              <TableCell className={cn(cell, "w-10 text-end")}>
                {/* Stretched over the row (the row is `relative`): the whole row opens the details */}
                <button
                  type="button"
                  aria-label={`تفاصيل ${actionLabel(entry.action)}`}
                  onClick={() => onOpen(entry)}
                  className="inline-flex cursor-pointer text-fg-subtle outline-none after:absolute after:inset-0 after:content-['']"
                >
                  <CaretLeft aria-hidden className="size-4.5" />
                </button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function AuditLogTableSkeleton() {
  return (
    <Table>
      <Head />
      <TableBody>
        <TableSkeletonRows rows={6} columns={COLUMNS} />
      </TableBody>
    </Table>
  );
}

/** Small screens: who and what on top, the change, then on whom and when. The whole card opens the details. */
export function AuditLogCards({ entries, onOpen }: ListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {entries.map((entry) => {
        const summary = changeSummary(entry);
        const subject = subjectName(entry);
        return (
          <li
            key={entry.id}
            className="relative rounded-2xl border border-ink/6 bg-surface shadow-card transition-colors active:bg-neutral-100 has-focus-visible:ring-2 has-focus-visible:ring-focus has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-bg"
          >
            <button
              type="button"
              onClick={() => onOpen(entry)}
              aria-label={`تفاصيل ${actionLabel(entry.action)}`}
              className="absolute inset-0 rounded-2xl outline-none"
            />
            <div className="pointer-events-none flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <AuditActor entry={entry} />
                <AuditAction action={entry.action} />
              </div>
              {summary && <p className="text-sm text-fg">{summary}</p>}
              <div className="flex items-center justify-between gap-3 border-t border-divider pt-3 text-sm">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  {subject && <span className="font-medium text-fg">{subject}</span>}
                  <span className="text-xs text-fg-muted">
                    {formatDate(entry.created_at)} · {formatTime(entry.created_at)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 font-medium text-brand">
                  التفاصيل
                  <CaretRight aria-hidden className="size-4 rtl:-scale-x-100" />
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function AuditLogCardsSkeleton() {
  return (
    <ul aria-hidden className="flex flex-col gap-3">
      {Array.from({ length: 4 }, (_, index) => (
        <li key={index} className="flex flex-col gap-3 rounded-2xl border border-ink/6 bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-8 w-36 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-56" />
          <div className="flex items-center justify-between gap-3 border-t border-divider pt-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-14" />
          </div>
        </li>
      ))}
    </ul>
  );
}
