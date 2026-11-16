"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Receipt } from "@phosphor-icons/react";
import { Card, EmptyState, ErrorState, LoadMore, Tabs } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { getErrorMessage } from "@/lib/api/errors";
import type { AdminPayment, PaymentStatus } from "@/lib/api/types";
import { PaymentCards, PaymentCardsSkeleton } from "../components/PaymentCards";
import { PaymentReviewDialog } from "../components/PaymentReviewDialog";
import { PaymentsTable, PaymentsTableSkeleton } from "../components/PaymentsTable";
import { usePayments } from "../hooks";
import { statusTabs } from "../labels";

const parseStatus = (value: string | null): PaymentStatus => statusTabs.find((tab) => tab.value === value)?.value ?? "PENDING";

const emptyStates: Record<PaymentStatus, { title: string; description: string }> = {
  PENDING: { title: "لا توجد دفعات بانتظار المراجعة", description: "الطابور فارغ: كل الدفعات تمّ البتّ فيها." },
  APPROVED: { title: "لا توجد دفعات مقبولة بعد", description: "ستظهر هنا الدفعات التي تتم الموافقة عليها." },
  REJECTED: { title: "لا توجد دفعات مرفوضة", description: "ستظهر هنا الدفعات التي يتم رفضها مع السبب." },
};

/** Cards on small screens, the table from `lg` up: the list never scrolls sideways. */
function ByWidth({ cards, table }: { cards: ReactNode; table: ReactNode }) {
  return (
    <>
      <div className="lg:hidden">{cards}</div>
      <div className="hidden lg:block">{table}</div>
    </>
  );
}

/** The payment review queue. The status tab lives in the URL (`?status=`), so a view can be saved and shared. */
export function PaymentsScreen() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const status = parseStatus(searchParams.get("status"));

  const [reviewing, setReviewing] = useState<AdminPayment | null>(null);
  const query = usePayments(status);
  const payments = query.data?.pages.flatMap((page) => page.payments) ?? [];

  // PENDING is the default, so its URL stays clean
  const changeStatus = (next: PaymentStatus) =>
    router.replace(next === "PENDING" ? pathname : `${pathname}?status=${next}`, { scroll: false });

  let body;
  if (query.isPending) {
    body = <ByWidth cards={<PaymentCardsSkeleton />} table={<PaymentsTableSkeleton status={status} />} />;
  } else if (query.isError && !query.data) {
    body = (
      <Card>
        <ErrorState
          description={getErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      </Card>
    );
  } else if (payments.length === 0) {
    body = (
      <Card>
        <EmptyState
          icon={status === "PENDING" ? <CheckCircle /> : <Receipt />}
          title={emptyStates[status].title}
          description={emptyStates[status].description}
        />
      </Card>
    );
  } else {
    body = (
      <>
        <ByWidth
          cards={<PaymentCards payments={payments} status={status} onOpen={setReviewing} />}
          table={<PaymentsTable payments={payments} status={status} onOpen={setReviewing} />}
        />
        <LoadMore
          hasNextPage={query.hasNextPage}
          loading={query.isFetchingNextPage}
          onLoadMore={() => void query.fetchNextPage()}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="الدفعات"
        description={status === "PENDING" ? "الأقدم أولاً. طابق وصول المبلغ إلى الحساب قبل القبول." : "الأحدث أولاً."}
      />
      <Tabs label="حالة الدفعات" value={status} onValueChange={changeStatus} items={statusTabs} />
      {body}
      <PaymentReviewDialog payment={reviewing} onClose={() => setReviewing(null)} />
    </div>
  );
}
