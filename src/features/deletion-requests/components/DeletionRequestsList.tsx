"use client";

import { CaretLeft, CaretRight, NotePencil } from "@phosphor-icons/react";
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableSkeletonRows,
} from "@/components/ui";
import type { DeletionRequest } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatDate, formatTime } from "@/lib/format";
import { canOpenSubject, subjectName } from "../labels";
import { CancelDeletionButton, DeletionOrigin, DeletionState, DeletionSubject } from "./DeletionRequestParts";

type ListProps = {
  requests: DeletionRequest[];
  /** Opens the merchant or customer page (not for a deleted customer: there is no page left). */
  onOpen: (request: DeletionRequest) => void;
  /** Missing for a role that can't cancel. */
  onCancel?: (request: DeletionRequest) => void;
};

const COLUMNS = 6;
const cell = "px-3";

function Head() {
  return (
    <TableHead>
      <tr>
        <TableHeaderCell className={cell}>الحساب</TableHeaderCell>
        <TableHeaderCell className={cell}>الحالة</TableHeaderCell>
        <TableHeaderCell className={cell}>المصدر</TableHeaderCell>
        <TableHeaderCell className={cell}>تاريخ الطلب</TableHeaderCell>
        <TableHeaderCell className={cell}>ملاحظة</TableHeaderCell>
        <TableHeaderCell className={cell}>
          <span className="sr-only">إجراءات</span>
        </TableHeaderCell>
      </tr>
    </TableHead>
  );
}

const Requested = ({ request }: { request: DeletionRequest }) => (
  <span className="flex flex-col">
    <span>{formatDate(request.requested_at)}</span>
    <span className="text-xs text-fg-muted">{formatTime(request.requested_at)}</span>
  </span>
);

export function DeletionRequestsTable({ requests, onOpen, onCancel }: ListProps) {
  return (
    <Table>
      <Head />
      <TableBody>
        {requests.map((request) => {
          const openable = canOpenSubject(request);
          return (
            <TableRow
              key={request.id}
              className={cn(
                "relative",
                openable &&
                  "cursor-pointer has-focus-visible:bg-neutral-50 has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-focus",
              )}
            >
              <TableCell className={cell}>
                <DeletionSubject request={request} className="max-w-56" />
              </TableCell>
              <TableCell className={cell}>
                <DeletionState request={request} />
              </TableCell>
              <TableCell className={cell}>
                <DeletionOrigin request={request} />
              </TableCell>
              <TableCell className={cell}>
                <Requested request={request} />
              </TableCell>
              <TableCell className={cn(cell, "max-w-56")}>
                {request.note ? (
                  <span className="line-clamp-2 text-sm text-fg-muted" title={request.note}>
                    {request.note}
                  </span>
                ) : (
                  <span className="text-fg-muted">—</span>
                )}
              </TableCell>
              <TableCell className={cn(cell, "text-end whitespace-nowrap")}>
                <span className="inline-flex items-center gap-2">
                  <CancelDeletionButton request={request} onCancel={onCancel} />
                  {openable && (
                    // Stretched over the row (the row is `relative`): the whole row opens the account
                    <button
                      type="button"
                      aria-label={`فتح ${subjectName(request)}`}
                      onClick={() => onOpen(request)}
                      className="inline-flex cursor-pointer text-fg-subtle outline-none after:absolute after:inset-0 after:content-['']"
                    >
                      <CaretLeft aria-hidden className="size-4.5" />
                    </button>
                  )}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function DeletionRequestsTableSkeleton() {
  return (
    <Table>
      <Head />
      <TableBody>
        <TableSkeletonRows rows={6} columns={COLUMNS} />
      </TableBody>
    </Table>
  );
}

/** The small-screen layout of the same list: who and what state, where from, when, the note. */
export function DeletionRequestCards({ requests, onOpen, onCancel }: ListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {requests.map((request) => {
        const openable = canOpenSubject(request);
        return (
          <li
            key={request.id}
            className={cn(
              "relative rounded-2xl border border-ink/6 bg-surface shadow-card",
              openable &&
                "transition-colors active:bg-neutral-100 has-focus-visible:ring-2 has-focus-visible:ring-focus has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-bg",
            )}
          >
            {openable && (
              <button
                type="button"
                onClick={() => onOpen(request)}
                aria-label={`فتح ${subjectName(request)}`}
                className="absolute inset-0 rounded-2xl outline-none"
              />
            )}
            <div className="pointer-events-none flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <DeletionSubject request={request} />
                <DeletionState request={request} className="shrink-0 items-end" />
              </div>
              <DeletionOrigin request={request} className="text-sm" />
              {request.note && (
                <p className="flex items-start gap-1.5 rounded-md bg-neutral-50 px-2.5 py-1.5 text-sm text-fg">
                  <NotePencil aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                  {request.note}
                </p>
              )}
              <div className="flex items-center justify-between gap-3 border-t border-divider pt-3 text-sm">
                <span className="text-fg-muted">
                  طُلب {formatDate(request.requested_at)} · {formatTime(request.requested_at)}
                </span>
                <span className="pointer-events-auto flex items-center gap-2">
                  <CancelDeletionButton request={request} onCancel={onCancel} />
                  {openable && <CaretRight aria-hidden className="size-4 text-fg-subtle rtl:-scale-x-100" />}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function DeletionRequestCardsSkeleton() {
  return (
    <ul aria-hidden className="flex flex-col gap-3">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="flex flex-col gap-3 rounded-2xl border border-ink/6 bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-xl" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40" />
          <div className="flex items-center justify-between border-t border-divider pt-3">
            <Skeleton className="h-4 w-36" />
          </div>
        </li>
      ))}
    </ul>
  );
}
