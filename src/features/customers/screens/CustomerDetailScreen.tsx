"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretRight, Cake } from "@phosphor-icons/react";
import { Button, Card, ErrorState, Skeleton } from "@/components/ui";
import { getErrorMessage } from "@/lib/api/errors";
import type { CustomerCycle } from "@/lib/api/types";
import { Can } from "@/lib/auth/can";
import { BirthdateDialog } from "../components/BirthdateDialog";
import { CustomerHero, CyclesList } from "../components/CustomerDetailSections";
import { CycleDialog } from "../components/CycleDialog";
import { useCustomer } from "../hooks";

type CustomerDetailScreenProps = {
  id: number;
  /** Back to the search. By default a link to `/admin/customers`; the dev preview passes its own. */
  onBack?: () => void;
};

const backClass =
  "inline-flex items-center gap-1 self-start rounded-md text-sm text-fg-muted transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none";

function BackToSearch({ onBack }: { onBack?: () => void }) {
  // The caret points toward the search: right in RTL is "back", so it keeps its direction
  const content = (
    <>
      <CaretRight aria-hidden className="size-4" />
      الزبائن
    </>
  );
  if (onBack) {
    return (
      <button type="button" onClick={onBack} className={backClass}>
        {content}
      </button>
    );
  }
  return (
    <Link href="/admin/customers" className={backClass}>
      {content}
    </Link>
  );
}

/** One customer: who they are, the phone behind a logged reveal, the birthdate fix, and their cycles. */
export function CustomerDetailScreen({ id, onBack }: CustomerDetailScreenProps) {
  const query = useCustomer(id);
  const [openCycle, setOpenCycle] = useState<CustomerCycle | null>(null);
  const [editingBirthdate, setEditingBirthdate] = useState(false);
  // The age is counted on the day the page opened: read once, so a re-render never changes it
  const [now] = useState(() => new Date());

  let body;
  if (query.isPending) {
    body = (
      <div aria-hidden className="flex flex-col gap-5">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
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
              العودة إلى البحث
            </Button>
          ) : (
            <Link href="/admin/customers" className="text-sm text-brand hover:underline">
              العودة إلى البحث
            </Link>
          )}
        </div>
      </Card>
    );
  } else {
    const customer = query.data;
    body = (
      <>
        <CustomerHero
          customer={customer}
          now={now}
          actions={
            <Can permission="edit-customer-birthdate">
              <Button variant="secondary" icon={<Cake className="size-4.5" />} onClick={() => setEditingBirthdate(true)}>
                تعديل تاريخ الميلاد
              </Button>
            </Can>
          }
        />
        <CyclesList customer={customer} onOpen={setOpenCycle} />
        <CycleDialog
          cycleId={openCycle?.id ?? null}
          title={openCycle ? `${openCycle.card.name} · ${openCycle.merchant.business_name}` : ""}
          onClose={() => setOpenCycle(null)}
        />
        {editingBirthdate && <BirthdateDialog customer={customer} onClose={() => setEditingBirthdate(false)} />}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <BackToSearch onBack={onBack} />
      {body}
    </div>
  );
}
