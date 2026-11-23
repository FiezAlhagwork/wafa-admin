"use client";

import { useState } from "react";
import { Package, Plus } from "@phosphor-icons/react";
import { Button, Card, EmptyState, ErrorState } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { getErrorMessage } from "@/lib/api/errors";
import type { AdminPackage } from "@/lib/api/types";
import { PackageCard, PackageCardsSkeleton } from "../components/PackageCard";
import { PackageFormDialog } from "../components/PackageFormDialog";
import { usePackages } from "../hooks";

/** The packages merchants subscribe to from the app, with their limits and prices. No pagination: a handful. */
export function PackagesScreen() {
  const [editing, setEditing] = useState<"new" | AdminPackage | null>(null);
  const query = usePackages();
  const addButton = (
    <Button variant="accent" icon={<Plus className="size-4" weight="bold" />} onClick={() => setEditing("new")}>
      إضافة باقة
    </Button>
  );

  let body;
  if (query.isPending) {
    body = <PackageCardsSkeleton />;
  } else if (query.data === undefined) {
    body = (
      <Card>
        <ErrorState
          description={getErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      </Card>
    );
  } else if (query.data.length === 0) {
    body = (
      <Card>
        <EmptyState
          icon={<Package />}
          title="لا توجد باقات"
          description="أضف أول باقة ليتمكن التجار من الاشتراك من التطبيق."
          action={addButton}
        />
      </Card>
    );
  } else {
    body = (
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {query.data.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} onOpen={setEditing} />
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="الباقات والأسعار"
        description="ما يراه التاجر عند الاشتراك من التطبيق. الأسعار بالدولار."
        actions={addButton}
      />
      {body}
      {editing !== null && (
        // Keyed by package so opening another one starts from its own values
        <PackageFormDialog key={editing === "new" ? "new" : editing.id} target={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
