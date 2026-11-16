"use client";

import type { ReactNode } from "react";
import { CalendarX } from "@phosphor-icons/react";
import { Card, CardHeader, EmptyState, ErrorState, Skeleton, StatusBadge, type Status } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { getErrorMessage } from "@/lib/api/errors";
import type { AdminOverview } from "@/lib/api/types";
import { useAdmin } from "@/lib/auth/admin-provider";
import { usePermission } from "@/lib/auth/can";
import { cn } from "@/lib/cn";
import { formatDate, formatMonth, formatNumber, formatRelativeDays, formatSyp, formatUsd } from "@/lib/format";
import { useOverview } from "../hooks";

// Same order as the merchant lifecycle. The bar color follows the StatusBadge tone of each status.
const merchantStatuses: { status: Status; bar: string }[] = [
  { status: "TRIAL", bar: "bg-info" },
  { status: "ACTIVE", bar: "bg-success" },
  { status: "GRACE", bar: "bg-warning" },
  { status: "EXPIRED", bar: "bg-neutral-400" },
  { status: "SUSPENDED", bar: "bg-danger" },
  { status: "PENDING_DELETION", bar: "bg-danger/60" },
  { status: "DELETED", bar: "bg-danger/30" },
];

// Registering merchants have no status yet: the lightest piece, so the bar always adds up to the total.
const REGISTERING_BAR = "bg-neutral-200";

/** The home page: counts, alerts, trials ending and (with `view-financials`) this month's income. */
export function OverviewScreen() {
  const { user } = useAdmin();
  const canSeeFinance = usePermission("view-financials");
  const overview = useOverview();
  const data = overview.data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`أهلاً ${user.name.trim().split(/\s+/)[0]}`} description={formatDate(new Date().toISOString())} />

      {overview.isError ? (
        <Card>
          <ErrorState
            description={getErrorMessage(overview.error)}
            onRetry={() => overview.refetch()}
            retrying={overview.isFetching}
          />
        </Card>
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-3">
          <div className="flex flex-col gap-6 xl:col-span-2">
            <Merchants data={data?.merchants} />
            {/* `finance` is null without `view-financials`: the card is not shown at all */}
            {canSeeFinance && <Finance data={data?.finance ?? undefined} />}
          </div>
          <div className="flex flex-col gap-6">
            <Attention data={data?.alerts} />
            <TrialsEnding data={data?.trials_ending_this_week} />
          </div>
        </div>
      )}
    </div>
  );
}

/** A number with its label: the building block of the figure strips. */
function Figure({ label, value, accent = false, className }: { label: string; value: string | undefined; accent?: boolean; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5 p-4", className)}>
      <span className="text-xs text-fg-muted">{label}</span>
      {value === undefined ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <span className="flex items-center gap-2">
          {accent && <span aria-hidden className="h-6 w-1 shrink-0 rounded-full bg-amber" />}
          <span className="truncate text-2xl font-semibold tabular-nums text-fg">{value}</span>
        </span>
      )}
    </div>
  );
}

function Merchants({ data }: { data: AdminOverview["merchants"] | undefined }) {
  const total = data?.total ?? 0;

  // One list drives both the bar and the rows, so each colored square matches its piece of the bar.
  // Registering merchants have no status (they are not in `by_status`) but they are part of the total.
  const segments: { key: string; status: Status | null; bar: string; count: number }[] = [
    ...merchantStatuses.map(({ status, bar }) => ({ key: status, status, bar, count: data?.by_status[status] ?? 0 })),
    { key: "registering", status: null, bar: REGISTERING_BAR, count: data?.registering ?? 0 },
  ];

  return (
    <Card>
      <CardHeader title="التجار" />
      <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
        {/* The one headline number of the screen */}
        <Figure label="إجمالي التجار" value={data && formatNumber(data.total)} accent />
        <Figure label="قيد التسجيل (بلا باقة بعد)" value={data && formatNumber(data.registering)} />
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Distribution: a picture of the list below it, so it is hidden from screen readers */}
        <div aria-hidden className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-neutral-100">
          {data &&
            segments.map(({ key, bar, count }) =>
              count > 0 ? <span key={key} className={bar} style={{ width: `${(count * 100) / total}%` }} /> : null,
            )}
        </div>

        <ul className="divide-y divide-border">
          {segments.map(({ key, status, bar, count }) => (
            <li key={key} className="flex items-center justify-between gap-3 py-2">
              <span className="flex items-center gap-2.5">
                <span aria-hidden className={cn("size-2 shrink-0 rounded-sm", bar)} />
                <StatusBadge status={status} />
              </span>
              {data ? (
                <span className={cn("flex items-baseline gap-2 text-sm tabular-nums", count === 0 && "text-fg-muted")}>
                  <span className="font-semibold">{formatNumber(count)}</span>
                  <span className="w-9 text-end text-xs text-fg-muted">
                    {total === 0 ? 0 : Math.round((count * 100) / total)}%
                  </span>
                </span>
              ) : (
                <Skeleton className="h-4 w-14" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function Finance({ data }: { data: NonNullable<AdminOverview["finance"]> | undefined }) {
  return (
    <Card>
      <CardHeader title="دخل الشهر" description={data ? formatMonth(data.month) : <Skeleton className="h-3.5 w-24" />} />
      {/* USD and SYP are never added together: each keeps its own cell */}
      <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Figure label="دفعات مقبولة" value={data && formatNumber(data.count)} />
        <Figure label="بالدولار" value={data && formatUsd(data.price_usd)} />
        <Figure label="بالليرة" value={data && formatSyp(data.amount_syp)} />
      </div>
    </Card>
  );
}

/** Warning only when there is something to do; a zero is a quiet gray row. */
function Attention({ data }: { data: AdminOverview["alerts"] | undefined }) {
  const rows: { label: string; hint?: string; count: number | undefined }[] = [
    { label: "دفعات بانتظار المراجعة", count: data?.payments_pending },
    { label: "دفعات متأخرة", count: data?.payments_overdue },
    { label: "دفعات برقم مرجع مكرر", count: data?.payments_duplicate_reference },
    { label: "طلبات حذف جديدة", hint: "آخر 7 أيام", count: data?.deletion_requests_new },
    { label: "تجار بانتظار الحذف", count: data?.merchants_pending_deletion },
  ];

  return (
    <Card>
      <CardHeader title="تحتاج انتباهك" />
      <ul className="divide-y divide-border">
        {rows.map(({ label, hint, count }) => (
          <li key={label} className="flex items-center gap-2.5 px-4 py-2.5 text-sm">
            <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", count ? "bg-warning" : "bg-neutral-300")} />
            <span className={cn("min-w-0 flex-1 truncate", count ? "text-fg" : "text-fg-muted")}>
              {label}
              {hint && <span className="ms-1.5 text-xs text-fg-muted">{hint}</span>}
            </span>
            {count === undefined ? (
              <Skeleton className="h-4 w-6" />
            ) : (
              <span className={cn("font-semibold tabular-nums", count ? "text-warning" : "text-fg-muted")}>
                {formatNumber(count)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function TrialsEnding({ data }: { data: AdminOverview["trials_ending_this_week"] | undefined }) {
  let body: ReactNode;
  if (!data) {
    body = (
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  } else if (data.merchants.length === 0) {
    body = <EmptyState className="py-8" icon={<CalendarX />} title="لا توجد تجارب تنتهي هذا الأسبوع" />;
  } else {
    body = (
      <ul className="divide-y divide-border">
        {data.merchants.map((merchant) => (
          <li key={merchant.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="min-w-0 truncate text-sm font-medium text-fg">{merchant.business_name}</span>
            <span className="flex shrink-0 flex-col items-end">
              <span className="text-sm text-fg">{formatRelativeDays(merchant.trial_ends_at)}</span>
              <span className="text-xs text-fg-muted">{formatDate(merchant.trial_ends_at)}</span>
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Card>
      <CardHeader
        title="تجارب تنتهي هذا الأسبوع"
        description={data ? `${formatNumber(data.count)} تاجر` : <Skeleton className="h-3.5 w-14" />}
      />
      {body}
    </Card>
  );
}
