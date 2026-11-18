"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BellRinging,
  CalendarX,
  CaretLeft,
  ChartPieSlice,
  CheckCircle,
  ClockCountdown,
  CopySimple,
  CreditCard,
  Hourglass,
  Storefront,
  Trash,
  UserMinus,
} from "@phosphor-icons/react";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  IconTile,
  Skeleton,
  StatCard,
  statusLabel,
  type IconTone,
  type Status,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { usePendingPreview } from "@/features/payments/hooks";
import { formatDuration } from "@/features/payments/labels";
import { getErrorMessage } from "@/lib/api/errors";
import type { AdminOverview } from "@/lib/api/types";
import { useAdmin } from "@/lib/auth/admin-provider";
import { Can, usePermission } from "@/lib/auth/can";
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

const PENDING_PREVIEW = 5;

/** The home page: headline numbers, merchants by status, what needs attention, the payment queue and trials ending. */
export function OverviewScreen() {
  const { user } = useAdmin();
  const router = useRouter();
  const canReview = usePermission("review-payments");
  const overview = useOverview();
  const data = overview.data;
  const pending = data?.alerts.payments_pending ?? 0;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title={`أهلاً ${user.name.trim().split(/\s+/)[0]}`}
        description={`هذه حالة المنصة اليوم، ${formatDate(new Date().toISOString())}.`}
        actions={
          canReview && (
            <Button variant="accent" size="lg" onClick={() => router.push("/admin/payments")}>
              مراجعة الدفعات
              {pending > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-ink px-1.5 text-xs text-neutral-0 tabular-nums">
                  {formatNumber(pending)}
                </span>
              )}
            </Button>
          )
        }
      />

      {overview.isError ? (
        <Card>
          <ErrorState
            description={getErrorMessage(overview.error)}
            onRetry={() => overview.refetch()}
            retrying={overview.isFetching}
          />
        </Card>
      ) : (
        <>
          <Headline data={data} />
          <Merchants data={data?.merchants} />
          <div className="grid items-start gap-5 xl:grid-cols-3">
            <div className="flex flex-col gap-5 xl:col-span-2">
              <Can permission="review-payments">
                <PendingPayments />
              </Can>
              <Attention data={data?.alerts} />
            </div>
            <TrialsEnding data={data?.trials_ending_this_week} />
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Four headline numbers. The ink card is the month's income for those who may see it (`finance` is null without
 * `view-financials`), otherwise the merchant total. USD and SYP are never added: the pounds big, the dollars under.
 */
function Headline({ data }: { data: AdminOverview | undefined }) {
  const canSeeFinance = usePermission("view-financials");
  const loading = !data;
  const count = (status: Status) => formatNumber(data?.merchants.by_status[status] ?? 0);
  const alerts = data?.alerts;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {canSeeFinance ? (
        <StatCard
          tone="accent"
          label={data?.finance ? `دخل ${formatMonth(data.finance.month)}` : "دخل الشهر"}
          value={data?.finance ? formatSyp(data.finance.amount_syp) : "—"}
          hint={
            data?.finance &&
            `${formatUsd(data.finance.price_usd)} · ${formatNumber(data.finance.count)} دفعة مقبولة`
          }
          loading={loading}
        />
      ) : (
        <StatCard
          tone="accent"
          label="إجمالي التجار"
          value={formatNumber(data?.merchants.total ?? 0)}
          hint={data && `${formatNumber(data.merchants.registering)} قيد التسجيل`}
          loading={loading}
        />
      )}
      <StatCard
        label="التجار الفعّالون"
        value={count("ACTIVE")}
        icon={<Storefront />}
        iconTone="teal"
        hint={data && `من ${formatNumber(data.merchants.total)} تاجر مسجّل`}
        loading={loading}
      />
      <StatCard
        label="في فترة التجربة"
        value={count("TRIAL")}
        icon={<Hourglass />}
        iconTone="info"
        hint={data && `${formatNumber(data.trials_ending_this_week.count)} تنتهي تجربتهم هذا الأسبوع`}
        loading={loading}
      />
      <StatCard
        label="دفعات بانتظار المراجعة"
        value={formatNumber(alerts?.payments_pending ?? 0)}
        tone={alerts?.payments_pending ? "warning" : "default"}
        icon={<CreditCard />}
        iconTone="warning"
        hint={alerts && `${formatNumber(alerts.payments_overdue)} متأخرة · ${formatNumber(alerts.payments_duplicate_reference)} بمرجع مكرر`}
        loading={loading}
      />
    </div>
  );
}

function Merchants({ data }: { data: AdminOverview["merchants"] | undefined }) {
  const total = data?.total ?? 0;
  const percent = (count: number) => (total === 0 ? 0 : Math.round((count * 100) / total));

  // One list drives both the bar and the tiles, so each colored square matches its piece of the bar.
  // Registering merchants have no status (they are not in `by_status`) but they are part of the total.
  const segments: { key: string; status: Status | null; bar: string; count: number }[] = [
    ...merchantStatuses.map(({ status, bar }) => ({ key: status, status, bar, count: data?.by_status[status] ?? 0 })),
    { key: "registering", status: null, bar: REGISTERING_BAR, count: data?.registering ?? 0 },
  ];

  return (
    <Card>
      <CardHeader
        icon={<ChartPieSlice />}
        title="التجار حسب الحالة"
        description={data ? `${formatNumber(total)} تاجر مسجّل` : <Skeleton className="h-3.5 w-24" />}
      />
      <div className="flex flex-col gap-5 p-5">
        {/* Distribution: a picture of the tiles below it, so it is hidden from screen readers. Hover shows each piece. */}
        <div aria-hidden className="flex h-3.5 gap-1 overflow-hidden rounded-full bg-neutral-100">
          {data &&
            total > 0 &&
            segments.map(({ key, status, bar, count }) =>
              count > 0 ? (
                <span
                  key={key}
                  title={`${statusLabel(status)}: ${formatNumber(count)} · ${percent(count)}%`}
                  className={bar}
                  style={{ width: `${(count * 100) / total}%` }}
                />
              ) : null,
            )}
        </div>

        {/* One tile per status: its name, its count and its share sit together, so no number can be read as its neighbor's */}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {segments.map(({ key, status, bar, count }) => (
            <li key={key} className="flex min-w-0 flex-col gap-2 rounded-xl bg-neutral-50 p-3.5">
              <span className="flex min-w-0 items-center gap-2">
                <span aria-hidden className={cn("size-2.5 shrink-0 rounded-[3px]", bar)} />
                <span className={cn("truncate text-sm font-medium", count === 0 ? "text-fg-muted" : "text-fg")}>
                  {statusLabel(status)}
                </span>
              </span>
              {data ? (
                <span className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
                  <span className={cn("text-2xl leading-none font-black", count === 0 ? "text-fg-muted" : "text-fg")}>
                    {formatNumber(count)}
                  </span>
                  <span className="text-xs text-fg-muted">{percent(count)}% من الإجمالي</span>
                </span>
              ) : (
                <Skeleton className="h-6 w-16" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

const viewAll = (href: string, label: string) => (
  <Link
    href={href}
    className="inline-flex items-center gap-1 rounded-md text-sm font-bold text-brand outline-none hover:text-brand-hover focus-visible:ring-2 focus-visible:ring-focus"
  >
    {label}
    <CaretLeft aria-hidden className="size-4" />
  </Link>
);

/** The oldest payments of the queue (the queue's own order). Only for those who review payments. */
function PendingPayments() {
  const query = usePendingPreview(PENDING_PREVIEW);
  const payments = query.data?.payments ?? [];

  let body: ReactNode;
  if (query.isPending) {
    body = <RowsSkeleton />;
  } else if (query.isError) {
    body = (
      <ErrorState
        className="py-8"
        description={getErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  } else if (payments.length === 0) {
    body = <EmptyState className="py-8" icon={<CheckCircle />} title="لا توجد دفعات بانتظار المراجعة" />;
  } else {
    body = (
      <ul className="divide-y divide-divider">
        {payments.map((payment) => (
          <li key={payment.id} className="flex items-center gap-3.5 px-5 py-3.5">
            <Avatar name={payment.merchant?.business_name ?? "—"} seed={payment.merchant?.id} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate font-bold text-fg">{payment.merchant?.business_name ?? "—"}</span>
              <span className="truncate text-[13px] text-fg-muted">
                {payment.package.name} · {formatDuration(payment.duration_months)}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5 tabular-nums">
              <span className="font-bold whitespace-nowrap text-fg">{formatSyp(payment.amount_syp)}</span>
              <span className="text-xs text-fg-muted">{formatUsd(payment.price_usd)}</span>
            </div>
            <span
              className={cn(
                "hidden w-24 text-end text-[13px] sm:block",
                payment.overdue ? "font-bold text-warning" : "text-fg-muted",
              )}
            >
              {formatRelativeDays(payment.created_at)}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader
        icon={<CreditCard />}
        iconTone="warning"
        title="دفعات بانتظار المراجعة"
        description="الأقدم أولاً"
        actions={viewAll("/admin/payments", "عرض الكل")}
      />
      {body}
    </Card>
  );
}

/** Warning only when there is something to do; a zero is a quiet gray row. */
function Attention({ data }: { data: AdminOverview["alerts"] | undefined }) {
  const rows: { label: string; hint?: string; icon: ReactNode; tone: IconTone; count: number | undefined }[] = [
    { label: "دفعات متأخرة", icon: <ClockCountdown />, tone: "warning", count: data?.payments_overdue },
    { label: "دفعات برقم مرجع مكرر", icon: <CopySimple />, tone: "warning", count: data?.payments_duplicate_reference },
    { label: "طلبات حذف جديدة", hint: "آخر 7 أيام", icon: <UserMinus />, tone: "danger", count: data?.deletion_requests_new },
    { label: "تجار بانتظار الحذف", icon: <Trash />, tone: "danger", count: data?.merchants_pending_deletion },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader icon={<BellRinging />} iconTone="amber" title="تحتاج انتباهك" />
      <ul className="grid sm:grid-cols-2">
        {rows.map(({ label, hint, icon, tone, count }) => (
          <li
            key={label}
            className="flex items-center gap-3 border-b border-divider px-5 py-4 last:border-b-0 sm:odd:border-e sm:nth-last-[-n+2]:border-b-0"
          >
            <IconTile icon={icon} tone={count ? tone : "neutral"} size="sm" />
            <span className={cn("min-w-0 flex-1", count ? "text-fg" : "text-fg-muted")}>
              <span className="block truncate text-sm font-medium">{label}</span>
              {hint && <span className="text-xs text-fg-muted">{hint}</span>}
            </span>
            {count === undefined ? (
              <Skeleton className="h-6 w-8" />
            ) : (
              <span className={cn("text-2xl font-black tabular-nums", count ? "text-warning" : "text-fg-muted")}>
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
  const canOpen = usePermission("view-merchants-and-customers");

  let body: ReactNode;
  if (!data) {
    body = <RowsSkeleton />;
  } else if (data.merchants.length === 0) {
    body = <EmptyState className="py-8" icon={<CalendarX />} title="لا توجد تجارب تنتهي هذا الأسبوع" />;
  } else {
    body = (
      <ul className="divide-y divide-divider">
        {data.merchants.map((merchant) => {
          const content = (
            <>
              <Avatar name={merchant.business_name} seed={merchant.id} size="sm" />
              <span className="min-w-0 flex-1 truncate font-bold text-fg">{merchant.business_name}</span>
              <span className="flex shrink-0 flex-col items-end">
                <span className="text-sm font-bold text-fg">{formatRelativeDays(merchant.trial_ends_at)}</span>
                <span className="text-xs text-fg-muted">{formatDate(merchant.trial_ends_at)}</span>
              </span>
            </>
          );
          return (
            <li key={merchant.id}>
              {canOpen ? (
                <Link
                  href={`/admin/merchants/${merchant.id}`}
                  className="flex items-center gap-3 px-5 py-3 outline-none transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50"
                >
                  {content}
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-5 py-3">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader
        icon={<Hourglass />}
        iconTone="info"
        title="تنتهي تجربتهم هذا الأسبوع"
        description={data ? `${formatNumber(data.count)} تاجر` : <Skeleton className="h-3.5 w-14" />}
      />
      {body}
      {canOpen && data && data.count > 0 && (
        <div className="flex justify-center border-t border-divider py-3">
          {viewAll("/admin/merchants?trial_ending=week", "عرضهم في قائمة التجار")}
        </div>
      )}
    </Card>
  );
}

function RowsSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4 p-5">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
