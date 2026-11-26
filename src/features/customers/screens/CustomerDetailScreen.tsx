"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cake, Trash } from "@phosphor-icons/react";
import { BackLink } from "@/components/layout/BackLink";
import { AuditHistoryLink } from "@/features/audit-logs/components/AuditHistoryLink";
import { Button, Card, ErrorState, Skeleton } from "@/components/ui";
import { getErrorMessage } from "@/lib/api/errors";
import type { CustomerCycle } from "@/lib/api/types";
import { Can } from "@/lib/auth/can";
import { DeleteCustomerDialog } from "@/features/deletion-requests/components/DeletionDialogs";
import { BirthdateDialog } from "../components/BirthdateDialog";
import { CustomerHero, CyclesList } from "../components/CustomerDetailSections";
import { CycleDialog } from "../components/CycleDialog";
import { useCustomer } from "../hooks";

type CustomerDetailScreenProps = {
  id: number;
  /** Back to the search. By default a link to `/admin/customers`; the dev preview passes its own. */
  onBack?: () => void;
};

/** One customer: who they are, the phone behind a logged reveal, the birthdate fix, and their cycles. */
export function CustomerDetailScreen({ id, onBack }: CustomerDetailScreenProps) {
  const query = useCustomer(id);
  const [openCycle, setOpenCycle] = useState<CustomerCycle | null>(null);
  const [editingBirthdate, setEditingBirthdate] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  // The age is counted on the day the page opened: read once, so a re-render never changes it
  const [now] = useState(() => new Date());

  let body;
  // Nothing to show yet. With data on screen, a failed background refetch keeps it instead of an error
  if (query.data === undefined && !query.isError) {
    body = (
      <div aria-hidden className="flex flex-col gap-5">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
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
            <>
              <Can permission="edit-customer-birthdate">
                <Button variant="secondary" icon={<Cake className="size-4.5" />} onClick={() => setEditingBirthdate(true)}>
                  تعديل تاريخ الميلاد
                </Button>
              </Can>
              <Can permission="execute-deletion-requests">
                <Button
                  variant="secondary"
                  icon={<Trash className="size-4.5" />}
                  className="text-danger"
                  onClick={() => setDeleting(true)}
                >
                  حذف الحساب
                </Button>
              </Can>
            </>
          }
        />
        <CyclesList customer={customer} onOpen={setOpenCycle} />
        {openCycle && (
          <CycleDialog
            cycleId={openCycle.id}
            title={`${openCycle.card.name} · ${openCycle.merchant.business_name}`}
            onClose={() => setOpenCycle(null)}
          />
        )}
        {editingBirthdate && <BirthdateDialog customer={customer} onClose={() => setEditingBirthdate(false)} />}
        {deleting && (
          <DeleteCustomerDialog
            customer={customer}
            onClose={() => setDeleting(false)}
            // Nothing left to show here: back to the search
            onDeleted={() => (onBack ? onBack() : router.replace("/admin/customers"))}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <BackLink href="/admin/customers" label="الزبائن" onBack={onBack} />
        <AuditHistoryLink subjectType="customer" subjectId={id} />
      </div>
      {body}
    </div>
  );
}
