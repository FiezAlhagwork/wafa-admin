"use client";

import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { Button, Card, ErrorState, Skeleton } from "@/components/ui";
import { getErrorMessage } from "@/lib/api/errors";
import {
  CardsList,
  IdentityCard,
  MerchantAlerts,
  MerchantHero,
  RecentPayments,
  SubscriptionCard,
} from "../components/MerchantDetailSections";
import { useMerchant } from "../hooks";

type MerchantDetailScreenProps = {
  id: number;
  /** Back to the list. By default a link to `/admin/merchants`; the dev preview passes its own. */
  onBack?: () => void;
};

const backClass =
  "inline-flex items-center gap-1 self-start rounded-md text-sm text-fg-muted transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none";

function BackToList({ onBack }: { onBack?: () => void }) {
  const content = (
    <>
      <CaretRight aria-hidden className="size-4" />
      التجار
    </>
  );
  // The caret points toward the list: right in RTL is "back", so it keeps its direction (no flip)
  if (onBack) {
    return (
      <button type="button" onClick={onBack} className={backClass}>
        {content}
      </button>
    );
  }
  return (
    <Link href="/admin/merchants" className={backClass}>
      {content}
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-5">
      <Skeleton className="h-80 w-full rounded-2xl" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/** One merchant, read-only: who they are, their subscription, cards, stats and latest payments. */
export function MerchantDetailScreen({ id, onBack }: MerchantDetailScreenProps) {
  const query = useMerchant(id);

  let body;
  if (query.isPending) {
    body = <DetailSkeleton />;
  } else if (query.isError) {
    body = (
      <Card>
        <ErrorState
          description={getErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
        <div className="flex justify-center border-t border-divider p-4">
          {onBack ? (
            <Button variant="ghost" size="sm" onClick={onBack}>
              العودة إلى التجار
            </Button>
          ) : (
            <Link href="/admin/merchants" className="text-sm text-brand hover:underline">
              العودة إلى التجار
            </Link>
          )}
        </div>
      </Card>
    );
  } else {
    const merchant = query.data;
    body = (
      <>
        <MerchantHero merchant={merchant} />
        <MerchantAlerts merchant={merchant} />
        <div className="grid items-start gap-5 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-2">
            <SubscriptionCard merchant={merchant} />
            <CardsList merchant={merchant} />
            <RecentPayments merchant={merchant} />
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            <IdentityCard merchant={merchant} />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <BackToList onBack={onBack} />
      {body}
    </div>
  );
}
