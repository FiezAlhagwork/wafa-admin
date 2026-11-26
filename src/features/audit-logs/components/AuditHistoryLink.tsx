"use client";

import Link from "next/link";
import { ClockCounterClockwise } from "@phosphor-icons/react";
import { focusRing } from "@/components/ui";
import type { AuditSubjectType } from "@/lib/api/types";
import { usePermission } from "@/lib/auth/can";
import { cn } from "@/lib/cn";
import { filtersToSearch } from "../filters";

/** "سجل العمليات" on a merchant's or customer's page: the audit log filtered to them. Only with `view-audit-log`. */
export function AuditHistoryLink({ subjectType, subjectId }: { subjectType: AuditSubjectType; subjectId: number }) {
  const canView = usePermission("view-audit-log");
  if (!canView) return null;

  const search = filtersToSearch({ action: "", adminId: null, subjectType, subjectId });
  return (
    <Link
      href={`/admin/audit-logs${search}`}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-bold text-brand hover:bg-brand-soft",
        focusRing,
      )}
    >
      <ClockCounterClockwise aria-hidden className="size-4.5" />
      سجل العمليات
    </Link>
  );
}
