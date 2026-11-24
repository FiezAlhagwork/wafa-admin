"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserMinus } from "@phosphor-icons/react";
import { Button, ByWidth, Card, EmptyState, ErrorState, LoadMore, Tabs } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { getErrorMessage } from "@/lib/api/errors";
import type { DeletionRequest } from "@/lib/api/types";
import { usePermission } from "@/lib/auth/can";
import { cn } from "@/lib/cn";
import { CancelDeletionDialog } from "../components/DeletionDialogs";
import {
  DeletionRequestCards,
  DeletionRequestCardsSkeleton,
  DeletionRequestsTable,
  DeletionRequestsTableSkeleton,
} from "../components/DeletionRequestsList";
import { filtersToSearch, parseFilters, type DeletionFilters } from "../filters";
import { useDeletionRequests } from "../hooks";
import { emptyStates, statusTabs, subjectChips, subjectName } from "../labels";

type DeletionRequestsScreenProps = {
  /** Opens the account. By default its page; the dev preview passes its own. */
  onOpen?: (request: DeletionRequest) => void;
};

/**
 * Account deletion requests, newest first: customers who deleted themselves, and merchants who asked to leave (30 days
 * to change their mind, which an admin can cancel). Both filters live in the URL, so a view can be saved and shared.
 */
export function DeletionRequestsScreen({ onOpen }: DeletionRequestsScreenProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const filters = parseFilters(searchParams);
  const canCancel = usePermission("execute-deletion-requests");

  const [cancelling, setCancelling] = useState<DeletionRequest | null>(null);
  const query = useDeletionRequests(filters);
  const requests = query.data?.pages.flatMap((page) => page.requests) ?? [];

  const change = (next: DeletionFilters) => router.replace(`${pathname}${filtersToSearch(next)}`, { scroll: false });
  const open = (request: DeletionRequest) => {
    if (onOpen) return onOpen(request);
    router.push(`/admin/${request.subject_type === "merchant" ? "merchants" : "customers"}/${request.subject_id}`);
  };
  const listProps = { requests, onOpen: open, onCancel: canCancel ? setCancelling : undefined };

  let body;
  if (query.isPending) {
    body = <ByWidth cards={<DeletionRequestCardsSkeleton />} table={<DeletionRequestsTableSkeleton />} />;
  } else if (query.isError && !query.data) {
    body = (
      <Card>
        <ErrorState description={getErrorMessage(query.error)} onRetry={() => void query.refetch()} retrying={query.isFetching} />
      </Card>
    );
  } else if (requests.length === 0) {
    const empty = emptyStates[filters.status];
    body = (
      <Card>
        <EmptyState icon={<UserMinus />} title={empty.title} description={empty.description} />
      </Card>
    );
  } else {
    body = (
      <>
        <ByWidth cards={<DeletionRequestCards {...listProps} />} table={<DeletionRequestsTable {...listProps} />} />
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
      <PageHeader
        title="طلبات الحذف"
        description="الأحدث أولاً. حذف التاجر ينتظر 30 يوماً يمكن إلغاؤه خلالها، وحذف الزبون فوري."
      />
      <Tabs
        label="حالة الطلبات"
        value={filters.status}
        onValueChange={(status) => change({ ...filters, status })}
        items={statusTabs}
      />
      <div role="group" aria-label="نوع الحساب" className="flex flex-wrap gap-2">
        {subjectChips.map((chip) => {
          const active = filters.subject === chip.value;
          return (
            <Button
              key={chip.value || "all"}
              size="sm"
              variant="secondary"
              aria-pressed={active}
              className={cn("rounded-full", active && "border-brand bg-brand-soft text-brand hover:bg-brand-soft")}
              onClick={() => change({ ...filters, subject: chip.value })}
            >
              {chip.label}
            </Button>
          );
        })}
      </div>
      {body}
      {cancelling && (
        <CancelDeletionDialog requestId={cancelling.id} name={subjectName(cancelling)} onClose={() => setCancelling(null)} />
      )}
    </div>
  );
}
