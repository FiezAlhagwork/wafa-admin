"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretLeft, MagnifyingGlass, UserCircle } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { Avatar, Button, Card, EmptyState, ErrorState, Field, Input, Latin, Skeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { getErrorMessage } from "@/lib/api/errors";
import type { AdminCustomer } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { customerName, RegisteredBadge } from "../components/CustomerParts";
import { useCustomerSearch } from "../hooks";
import { phoneSearchSchema, type PhoneSearchInput, type PhoneSearchValues } from "../schemas";

/** The one result: the whole card opens the customer. */
function CustomerResult({ customer, onOpen }: { customer: AdminCustomer; onOpen: () => void }) {
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full cursor-pointer items-center gap-4 p-5 text-start transition-colors outline-none hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset"
      >
        <Avatar name={customer.name ?? ""} seed={customer.id} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-black text-fg">{customerName(customer)}</span>
            <RegisteredBadge customer={customer} />
          </div>
          <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-fg-muted">
            {customer.phone_masked && <Latin>{customer.phone_masked}</Latin>}
            <span>
              {customer.last_activity_at ? `آخر نشاط ${formatDate(customer.last_activity_at)}` : "لا يوجد نشاط بعد"}
            </span>
          </span>
        </div>
        <CaretLeft aria-hidden className="size-5 shrink-0 text-fg-subtle" />
      </button>
    </Card>
  );
}

type CustomersScreenProps = {
  /** Opens a customer. By default `/admin/customers/{id}`; the dev preview passes its own. */
  onOpen?: (id: number) => void;
};

/**
 * There is no list of customers: one is found by their full phone number. The number stays in this screen's state
 * (and the query cache) only, never in the URL, so it is not kept in the browser history or in shared links.
 */
export function CustomersScreen({ onOpen }: CustomersScreenProps) {
  const router = useRouter();
  const [phone, setPhone] = useState<string | null>(null);
  const search = useCustomerSearch(phone);

  const form = useForm<PhoneSearchInput, unknown, PhoneSearchValues>({
    resolver: zodResolver(phoneSearchSchema),
    defaultValues: { phone: "" },
  });
  const submit = form.handleSubmit((values) => {
    // The same number again: search again (the customer may have changed since)
    if (values.phone === phone) void search.refetch();
    setPhone(values.phone);
  });

  const open = (id: number) => (onOpen ? onOpen(id) : router.push(`/admin/customers/${id}`));

  let result;
  if (phone === null) {
    result = (
      <Card>
        <EmptyState
          icon={<MagnifyingGlass />}
          title="ابحث برقم الهاتف كاملاً"
          description="لا توجد قائمة زبائن. اكتب رقم الزبون كما يعطيك إياه، ويبقى مخفياً في النتيجة."
        />
      </Card>
    );
  } else if (search.isPending) {
    result = (
      <Card aria-hidden className="flex items-center gap-4 p-5">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </Card>
    );
  } else if (search.isError) {
    result = (
      <Card>
        <ErrorState
          description={getErrorMessage(search.error)}
          onRetry={() => void search.refetch()}
          retrying={search.isFetching}
        />
      </Card>
    );
  } else if (search.data === null) {
    result = (
      <Card>
        <EmptyState
          icon={<UserCircle />}
          title="لا يوجد زبون بهذا الرقم"
          description="تأكّد من الرقم كاملاً. الحساب المحذوف لا يظهر."
        />
      </Card>
    );
  } else {
    const customer = search.data;
    result = <CustomerResult customer={customer} onOpen={() => open(customer.id)} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="الزبائن" description="ابحث عن زبون برقم هاتفه لتفتح صفحته ودوراته." />

      <Card className="p-5">
        <form onSubmit={submit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <Field label="رقم الهاتف" error={form.formState.errors.phone?.message} className="flex-1">
            <Input
              dir="ltr"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="0933123456"
              className="text-start"
              {...form.register("phone")}
            />
          </Field>
          <Button
            type="submit"
            icon={<MagnifyingGlass className="size-4.5" />}
            loading={search.isFetching}
            className="sm:mt-7"
          >
            بحث
          </Button>
        </form>
      </Card>

      <div className={search.isFetching && !search.isPending ? "opacity-60 transition-opacity" : undefined}>{result}</div>
    </div>
  );
}
