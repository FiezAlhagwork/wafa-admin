"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChartLineUp, Receipt, X } from "@phosphor-icons/react";
import { Button, ByWidth, Card, EmptyState, ErrorState, LoadMore, Tabs } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaymentCards, PaymentCardsSkeleton } from "@/features/payments/components/PaymentCards";
import { PaymentsTable, PaymentsTableSkeleton } from "@/features/payments/components/PaymentsTable";
import { methodLabels } from "@/features/payments/labels";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { PaymentDetailsDialog } from "../components/PaymentDetailsDialog";
import { PeriodPicker } from "../components/PeriodPicker";
import { MonthlyChart, ReportBreakdowns, ReportSkeleton, RevenueHeadline } from "../components/ReportParts";
import {
  defaultPreset,
  filtersToSearch,
  isBackwards,
  parseFilters,
  periodRange,
  type FinanceFilters,
  type FinanceView,
  type HistoryMethod,
  type HistoryStatus,
} from "../filters";
import { usePaymentHistory, useRevenueReport } from "../hooks";

const views: { value: FinanceView; label: string }[] = [
  { value: "report", label: "التقرير" },
  { value: "payments", label: "سجل الدفعات" },
];

const statusTabs: { value: HistoryStatus; label: string }[] = [
  { value: "", label: "الكل" },
  { value: "PENDING", label: "بانتظار المراجعة" },
  { value: "APPROVED", label: "مقبولة" },
  { value: "REJECTED", label: "مرفوضة" },
];

const methodChips: { value: HistoryMethod; label: string }[] = [
  { value: "", label: "كل الطرق" },
  { value: "sham_cash", label: methodLabels.sham_cash },
  { value: "haram", label: methodLabels.haram },
];

type FinanceScreenProps = {
  /** Opens a merchant. By default its page; the dev preview passes its own. */
  onOpenMerchant?: (merchantId: number) => void;
};

/**
 * Income and the full payments history, for those with `view-financials`. Read only. Everything the screen shows is
 * in the URL (the view, the period, the history's filters), so a view can be saved and shared.
 */
export function FinanceScreen({ onOpenMerchant }: FinanceScreenProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const filters = parseFilters(searchParams);

  const change = (next: FinanceFilters) => router.replace(`${pathname}${filtersToSearch(next)}`, { scroll: false });
  // Each view starts clean: the two count different days (approval vs upload), so a period is not carried over
  const changeView = (view: FinanceView) =>
    change({ view, period: { preset: defaultPreset[view], from: "", to: "" }, status: "", method: "", merchantId: null });
  const openMerchant = (merchantId: number) =>
    onOpenMerchant ? onOpenMerchant(merchantId) : router.push(`/admin/merchants/${merchantId}`);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="المالية" description="الدخل من الاشتراكات، وسجل كل الدفعات. للاطلاع فقط." />
      <Tabs label="عرض المالية" value={filters.view} onValueChange={changeView} items={views} />
      {filters.view === "report" ? (
        <ReportView filters={filters} onChange={change} />
      ) : (
        <HistoryView
          filters={filters}
          onChange={change}
          onOpenMerchant={openMerchant}
          onOpenQueue={() => router.push("/admin/payments")}
        />
      )}
    </div>
  );
}

type ViewProps = { filters: FinanceFilters; onChange: (next: FinanceFilters) => void };

function ReportView({ filters, onChange }: ViewProps) {
  const backwards = isBackwards(filters.period);
  const query = useRevenueReport(periodRange(filters.period), !backwards);
  const report = query.data;

  let body: ReactNode;
  if (backwards) {
    body = null;
  } else if (query.isPending) {
    body = (
      <>
        <RevenueHeadline report={undefined} />
        <ReportSkeleton />
      </>
    );
  } else if (query.isError && !report) {
    body = (
      <Card>
        <ErrorState description={getErrorMessage(query.error)} onRetry={() => void query.refetch()} retrying={query.isFetching} />
      </Card>
    );
  } else if (report) {
    body = (
      <>
        <RevenueHeadline report={report} />
        {report.totals.count === 0 ? (
          <Card>
            <EmptyState
              icon={<ChartLineUp />}
              title="لا توجد دفعات مقبولة في هذه الفترة"
              description="جرّب فترة أطول، أو راجع طابور الدفعات."
            />
          </Card>
        ) : (
          <>
            <MonthlyChart report={report} />
            <ReportBreakdowns report={report} />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <PeriodPicker view="report" value={filters.period} onChange={(period) => onChange({ ...filters, period })} />
        <p className="text-sm text-fg-muted">الدفعات المقبولة حسب يوم قبولها، بتوقيت دمشق.</p>
      </div>
      {body}
    </>
  );
}

type HistoryViewProps = ViewProps & { onOpenMerchant: (merchantId: number) => void; onOpenQueue: () => void };

function HistoryView({ filters, onChange, onOpenMerchant, onOpenQueue }: HistoryViewProps) {
  const backwards = isBackwards(filters.period);
  const query = usePaymentHistory(
    { ...periodRange(filters.period), status: filters.status, method: filters.method, merchantId: filters.merchantId },
    !backwards,
  );
  const payments = query.data?.pages.flatMap((page) => page.payments) ?? [];
  const [openId, setOpenId] = useState<number | null>(null);
  // Looked up in the list on every render, so a refetch (a fresh proof link) reaches the open dialog
  const open = payments.find((payment) => payment.id === openId);

  const merchantName =
    filters.merchantId !== null
      ? (payments.find((payment) => payment.merchant?.id === filters.merchantId)?.merchant?.business_name ??
        `تاجر #${filters.merchantId}`)
      : null;
  const filtered =
    filters.status !== "" || filters.method !== "" || filters.merchantId !== null || filters.period.preset !== "all";
  const clear = () =>
    onChange({ ...filters, period: { preset: "all", from: "", to: "" }, status: "", method: "", merchantId: null });

  let body: ReactNode;
  if (backwards) {
    body = null;
  } else if (query.isPending) {
    body = <ByWidth cards={<PaymentCardsSkeleton />} table={<PaymentsTableSkeleton queue={false} />} />;
  } else if (query.isError && !query.data) {
    body = (
      <Card>
        <ErrorState description={getErrorMessage(query.error)} onRetry={() => void query.refetch()} retrying={query.isFetching} />
      </Card>
    );
  } else if (payments.length === 0) {
    body = (
      <Card>
        <EmptyState
          icon={<Receipt />}
          title={filtered ? "لا توجد دفعات بهذه الفلاتر" : "لا توجد دفعات بعد"}
          description={filtered ? "غيّر الفلاتر أو امسحها لترى كل الدفعات." : "تظهر هنا كل دفعات التجار بكل حالاتها."}
          action={
            filtered && (
              <Button variant="secondary" size="sm" onClick={clear}>
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
        <ByWidth
          cards={<PaymentCards payments={payments} queue={false} onOpen={(payment) => setOpenId(payment.id)} />}
          table={<PaymentsTable payments={payments} queue={false} onOpen={(payment) => setOpenId(payment.id)} />}
        />
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
    <>
      <Tabs
        label="حالة الدفعات"
        value={filters.status}
        onValueChange={(status) => onChange({ ...filters, status })}
        items={statusTabs}
      />
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="طريقة الدفع" className="flex flex-wrap gap-2">
            {methodChips.map((chip) => (
              <Chip
                key={chip.value || "all"}
                active={filters.method === chip.value}
                onClick={() => onChange({ ...filters, method: chip.value })}
              >
                {chip.label}
              </Chip>
            ))}
          </div>
          {merchantName && (
            <span className="inline-flex h-8 items-center gap-1 rounded-full border border-brand bg-brand-soft ps-3 pe-1 text-sm font-medium text-brand">
              دفعات {merchantName}
              <button
                type="button"
                aria-label="إزالة فلتر التاجر"
                onClick={() => onChange({ ...filters, merchantId: null })}
                className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full outline-none hover:bg-brand/10 focus-visible:ring-2 focus-visible:ring-focus"
              >
                <X aria-hidden className="size-3.5" />
              </button>
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <PeriodPicker view="payments" value={filters.period} onChange={(period) => onChange({ ...filters, period })} />
          <p className="text-sm text-fg-muted">الأحدث أولاً. الفترة حسب يوم إرسال الدفعة، بتوقيت دمشق.</p>
        </div>
      </div>
      {body}
      {open && (
        <PaymentDetailsDialog
          payment={open}
          refreshing={query.isRefetching}
          onRefresh={async () => {
            const { data } = await query.refetch();
            return data?.pages.flatMap((page) => page.payments).find((payment) => payment.id === openId);
          }}
          onOpenMerchant={onOpenMerchant}
          onOpenQueue={onOpenQueue}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
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
