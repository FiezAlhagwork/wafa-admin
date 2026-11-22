"use client";

import { useState } from "react";
import Link from "next/link";
import { BackLink } from "@/components/layout/BackLink";
import { Button, Card, ErrorState, Skeleton } from "@/components/ui";
import { getErrorMessage } from "@/lib/api/errors";
import { usePermission } from "@/lib/auth/can";
import { MerchantActionDialog, type MerchantAction } from "../components/MerchantActionDialogs";
import { MerchantActions } from "../components/MerchantActions";
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

/** One merchant: who they are, their subscription, cards, stats and latest payments, and the actions the role allows. */
export function MerchantDetailScreen({ id, onBack }: MerchantDetailScreenProps) {
  const query = useMerchant(id);
  const [action, setAction] = useState<MerchantAction | null>(null);
  const canEditIdentity = usePermission("edit-business-identity");
  const canSuspend = usePermission("suspend-merchants");

  let body;
  // Nothing to show yet. With data on screen, a failed background refetch keeps it instead of an error
  if (query.data === undefined && !query.isError) {
    body = <DetailSkeleton />;
  } else if (query.data === undefined) {
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
    // DELETED is in the backend guide but not in the generated status type (A07)
    const status: string | null = merchant.status;
    const deleted = status === "DELETED";
    body = (
      <>
        <MerchantHero merchant={merchant} actions={<MerchantActions merchant={merchant} onAction={setAction} />} />
        <MerchantAlerts merchant={merchant} />
        <div className="grid items-start gap-5 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-2">
            <SubscriptionCard merchant={merchant} />
            <CardsList
              merchant={merchant}
              onSuspendCard={canSuspend && !deleted ? (card) => setAction({ type: "suspend-card", card }) : undefined}
            />
            <RecentPayments merchant={merchant} />
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            <IdentityCard
              merchant={merchant}
              onRemoveCover={canEditIdentity ? () => setAction({ type: "remove-cover" }) : undefined}
            />
          </div>
        </div>
        <MerchantActionDialog merchant={merchant} action={action} onClose={() => setAction(null)} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <BackLink href="/admin/merchants" label="التجار" onBack={onBack} />
      {body}
    </div>
  );
}
