"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ClipboardText, X } from "@phosphor-icons/react";
import { Button, ByWidth, Card, EmptyState, ErrorState, Field, LoadMore, Select } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAdminUsers } from "@/features/admin-users/hooks";
import { getErrorMessage } from "@/lib/api/errors";
import type { AuditLogEntry } from "@/lib/api/types";
import { usePermission } from "@/lib/auth/can";
import { cn } from "@/lib/cn";
import { AuditEntryDialog } from "../components/AuditEntryDialog";
import { AuditLogCards, AuditLogCardsSkeleton, AuditLogTable, AuditLogTableSkeleton } from "../components/AuditLogList";
import { filtersToSearch, hasFilters, noFilters, parseFilters, type AuditFilters } from "../filters";
import { useAuditLogs } from "../hooks";
import { actionLabel, actionOptions, subjectChips, subjectName } from "../labels";

type AuditLogScreenProps = {
  /** Opens a merchant or customer page. By default the route; the dev preview passes its own. */
  onOpenSubject?: (href: string) => void;
};

/**
 * Every action taken from the dashboard, newest first, read only. The filters live in the URL, so a merchant's or a
 * customer's page can link straight to their own history.
 */
export function AuditLogScreen({ onOpenSubject }: AuditLogScreenProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const filters = parseFilters(searchParams);

  const query = useAuditLogs(filters);
  const entries = query.data?.pages.flatMap((page) => page.entries) ?? [];
  const [open, setOpen] = useState<AuditLogEntry | null>(null);

  const change = (next: AuditFilters) => router.replace(`${pathname}${filtersToSearch(next)}`, { scroll: false });
  const openSubject = (href: string) => (onOpenSubject ? onOpenSubject(href) : router.push(href));

  let body: ReactNode;
  if (query.isPending) {
    body = <ByWidth cards={<AuditLogCardsSkeleton />} table={<AuditLogTableSkeleton />} />;
  } else if (query.isError && !query.data) {
    body = (
      <Card>
        <ErrorState description={getErrorMessage(query.error)} onRetry={() => void query.refetch()} retrying={query.isFetching} />
      </Card>
    );
  } else if (entries.length === 0) {
    const filtered = hasFilters(filters);
    body = (
      <Card>
        <EmptyState
          icon={<ClipboardText />}
          title={filtered ? "لا توجد عمليات بهذه الفلاتر" : "لا توجد عمليات بعد"}
          description={filtered ? "غيّر الفلاتر أو امسحها لترى كل العمليات." : "تظهر هنا كل عملية تتم من لوحة الإدارة."}
          action={
            filtered && (
              <Button variant="secondary" size="sm" onClick={() => change(noFilters)}>
                مسح الفلاتر
              </Button>
            )
          }
        />
      </Card>
    );
  } else {
    body = (
      <>
        <ByWidth cards={<AuditLogCards entries={entries} onOpen={setOpen} />} table={<AuditLogTable entries={entries} onOpen={setOpen} />} />
        <LoadMore
          hasNextPage={query.hasNextPage}
          loading={query.isFetchingNextPage}
          onLoadMore={() => void query.fetchNextPage()}
          failed={query.isFetchNextPageError}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="سجل التدقيق" description="كل عملية من لوحة الإدارة، الأحدث أولاً. للاطلاع فقط." />

      <div className="flex flex-col gap-3">
        <div role="group" aria-label="نوع السجل" className="flex flex-wrap gap-2">
          {subjectChips.map((chip) => (
            <Chip
              key={chip.value || "all"}
              active={filters.subjectType === chip.value && filters.subjectId === null}
              // A type chip drops a single record's filter
              onClick={() => change({ ...filters, subjectType: chip.value, subjectId: null })}
            >
              {chip.label}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Field label="العملية" className="w-60 max-w-full">
            <Select
              value={filters.action}
              options={actionOptions}
              // A code from a link that the list lacks: shown as is, so the filter is visible
              placeholder={filters.action ? actionLabel(filters.action) : undefined}
              onValueChange={(action) => change({ ...filters, action })}
            />
          </Field>
          <AdminFilter value={filters.adminId} onChange={(adminId) => change({ ...filters, adminId })} />
          {filters.subjectType && filters.subjectId !== null && (
            <span className="inline-flex h-10.5 items-center gap-1 rounded-full border border-brand bg-brand-soft ps-4 pe-1.5 text-sm font-medium text-brand">
              سجل {subjectName({ subject_type: filters.subjectType, subject_id: filters.subjectId })}
              <button
                type="button"
                aria-label="إزالة فلتر السجل"
                onClick={() => change({ ...filters, subjectId: null })}
                className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full outline-none hover:bg-brand/10 focus-visible:ring-2 focus-visible:ring-focus"
              >
                <X aria-hidden className="size-3.5" />
              </button>
            </span>
          )}
          {hasFilters(filters) && (
            <Button variant="ghost" onClick={() => change(noFilters)}>
              مسح الفلاتر
            </Button>
          )}
        </div>
      </div>

      {body}
      {open && <AuditEntryDialog entry={open} onOpenSubject={openSubject} onClose={() => setOpen(null)} />}
    </div>
  );
}

/**
 * Who did it, from the admin accounts list. That list needs `manage-admin-accounts`: without it (or while it loads)
 * the filter is left out rather than offered empty.
 */
function AdminFilter({ value, onChange }: { value: number | null; onChange: (adminId: number | null) => void }) {
  const canList = usePermission("manage-admin-accounts");
  const admins = useAdminUsers({ enabled: canList });
  if (!canList || !admins.data) return null;

  const options = [
    { value: "", label: "كل الحسابات" },
    ...admins.data.map((admin) => ({ value: String(admin.id), label: admin.is_active ? admin.name : `${admin.name} (معطّل)` })),
  ];
  return (
    <Field label="من قام بها" className="w-56 max-w-full">
      <Select value={value ? String(value) : ""} options={options} onValueChange={(next) => onChange(next ? Number(next) : null)} />
    </Field>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Button
      size="sm"
      variant="secondary"
      aria-pressed={active}
      className={cn("rounded-full", active && "border-brand bg-brand-soft text-brand hover:bg-brand-soft")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
