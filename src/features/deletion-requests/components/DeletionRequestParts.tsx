"use client";

import { Storefront, User } from "@phosphor-icons/react";
import { Avatar, Button, StatusBadge } from "@/components/ui";
import type { DeletionRequest } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatDate, formatRelativeDays } from "@/lib/format";
import { sourceLabels, subjectName } from "../labels";

type Props = { request: DeletionRequest; className?: string };

/** Who the account is: its face, its name (a customer has none in the API), and whether a shop or a customer. */
export function DeletionSubject({ request, className }: Props) {
  const merchant = request.subject_type === "merchant";
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      {/* A customer has no name here: the avatar shows the kind of account, not "#" from "زبون #42" */}
      <Avatar name={request.subject_name ?? (merchant ? "تاجر" : "زبون")} seed={request.subject_id} size="sm" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-bold text-fg">{subjectName(request)}</span>
        <span className="flex items-center gap-1 text-xs text-fg-muted">
          {merchant ? <Storefront aria-hidden className="size-3.5" /> : <User aria-hidden className="size-3.5" />}
          {merchant ? "تاجر" : "زبون"}
        </span>
      </div>
    </div>
  );
}

/** The state, and the date that matters for it: when it runs (pending), or when it was done or cancelled. */
export function DeletionState({ request, className }: Props) {
  let when: string | null = null;
  if (request.status === "pending" && request.executes_at) when = `يُنفَّذ ${formatRelativeDays(request.executes_at)}`;
  if (request.status === "executed" && request.executed_at) when = formatDate(request.executed_at);
  if (request.status === "cancelled" && request.cancelled_at) when = formatDate(request.cancelled_at);

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <StatusBadge status={request.status} />
      {when && <span className="text-xs text-fg-muted">{when}</span>}
    </div>
  );
}

/** Where the request came from, and who acted on it ("the customer" when they deleted it themselves). */
export function DeletionOrigin({ request, className }: Props) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-fg">{sourceLabels[request.source]}</span>
      <span className="text-xs text-fg-muted">
        {request.handled_by ? `بواسطة ${request.handled_by.name}` : "بواسطة صاحب الحساب"}
      </span>
    </div>
  );
}

/** Only a merchant still in the waiting period can be brought back. Sits above the row's own tap target. */
export function CancelDeletionButton({ request, onCancel }: { request: DeletionRequest; onCancel?: (request: DeletionRequest) => void }) {
  if (!onCancel || request.status !== "pending" || request.subject_type !== "merchant") return null;
  return (
    <Button variant="secondary" size="sm" className="relative z-10" onClick={() => onCancel(request)}>
      إلغاء الحذف
    </Button>
  );
}
