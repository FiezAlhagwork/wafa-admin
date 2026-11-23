"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass, Storefront } from "@phosphor-icons/react";
import { Button, ByWidth, Card, EmptyState, ErrorState, LoadMore } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { MerchantCards, MerchantCardsSkeleton } from "../components/MerchantCards";
import { MerchantFilters } from "../components/MerchantFilters";
import { MerchantsTable, MerchantsTableSkeleton } from "../components/MerchantsTable";
import { emptyFilters, filtersToSearch, parseFilters, toQuery, type MerchantFilters as Filters } from "../filters";
import { useMerchants } from "../hooks";

type MerchantsScreenProps = {
  /** Opens a merchant. By default the screen navigates to `/admin/merchants/{id}`; the dev preview passes its own. */
  onOpen?: (id: number) => void;
};

/** Every merchant, newest registration first. Search, status and "trial ends this week" live in the URL. */
export function MerchantsScreen({ onOpen }: MerchantsScreenProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const filters = parseFilters(searchParams);
  const filtered = filters.q !== "" || filters.status !== "" || filters.trialEnding;

  const query = useMerchants(toQuery(filters));
  const merchants = query.data?.pages.flatMap((page) => page.merchants) ?? [];

  const changeFilters = (next: Filters) => router.replace(`${pathname}${filtersToSearch(next)}`, { scroll: false });
  const open = (id: number) => (onOpen ? onOpen(id) : router.push(`/admin/merchants/${id}`));

  let body;
  if (query.isPending) {
    body = <ByWidth cards={<MerchantCardsSkeleton />} table={<MerchantsTableSkeleton />} />;
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
  } else if (merchants.length === 0) {
    body = (
      <Card>
        {filtered ? (
          <EmptyState
            icon={<MagnifyingGlass />}
            title="لا يوجد تجار مطابقون"
            description="جرّب بحثاً آخر أو أزل بعض الفلاتر."
            action={
              <Button variant="secondary" onClick={() => changeFilters(emptyFilters)}>
                مسح الفلاتر
              </Button>
            }
          />
        ) : (
          <EmptyState icon={<Storefront />} title="لا يوجد تجار بعد" description="سيظهر هنا كل من يسجّل في المنصة." />
        )}
      </Card>
    );
  } else {
    body = (
      <>
        {/* A new filter is loading: the previous list stays, dimmed, so the page does not jump */}
        <div className={cn("transition-opacity", query.isPlaceholderData && "pointer-events-none opacity-60")}>
          <ByWidth
            cards={<MerchantCards merchants={merchants} onOpen={(merchant) => open(merchant.id)} />}
            table={<MerchantsTable merchants={merchants} onOpen={(merchant) => open(merchant.id)} />}
          />
        </div>
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
      <PageHeader title="التجار" description="الأحدث تسجيلاً أولاً، ويشمل من لم يُكمل التسجيل بعد." />
      <MerchantFilters filters={filters} onChange={changeFilters} />
      {body}
    </div>
  );
}
