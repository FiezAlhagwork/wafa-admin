"use client";

import { useState, type ReactNode } from "react";
import { Plus, ShieldCheck } from "@phosphor-icons/react";
import { Button, Card, EmptyState, ErrorState } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { getErrorMessage } from "@/lib/api/errors";
import type { AdminUser } from "@/lib/api/types";
import { useAdmin } from "@/lib/auth/admin-provider";
import { AdminUserCards, AdminUserCardsSkeleton } from "../components/AdminUserCards";
import { AdminUserFormDialog } from "../components/AdminUserFormDialog";
import { AdminUsersTable, AdminUsersTableSkeleton } from "../components/AdminUsersTable";
import { useAdminUsers } from "../hooks";

/** Cards on small screens, the table from `lg` up: the list never scrolls sideways. */
function ByWidth({ cards, table }: { cards: ReactNode; table: ReactNode }) {
  return (
    <>
      <div className="lg:hidden">{cards}</div>
      <div className="hidden lg:block">{table}</div>
    </>
  );
}

/** The accounts that can sign in to the dashboard, and the role of each. No pagination: the list is a small team. */
export function AdminUsersScreen() {
  const selfId = useAdmin().user.id;
  const [editing, setEditing] = useState<"new" | AdminUser | null>(null);
  const query = useAdminUsers();

  let body;
  if (query.isPending) {
    body = <ByWidth cards={<AdminUserCardsSkeleton />} table={<AdminUsersTableSkeleton />} />;
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
  } else if (query.data.length === 0) {
    body = (
      <Card>
        <EmptyState
          icon={<ShieldCheck />}
          title="لا توجد حسابات"
          description="أضف أول حساب إدارة ليتمكن صاحبه من الدخول إلى اللوحة."
        />
      </Card>
    );
  } else {
    body = (
      <ByWidth
        cards={<AdminUserCards users={query.data} selfId={selfId} onOpen={setEditing} />}
        table={<AdminUsersTable users={query.data} selfId={selfId} onOpen={setEditing} />}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="حسابات الإدارة"
        description="الدور يحدد ما يظهر لكل شخص في اللوحة. يرتبط الحساب عند أول دخول بنفس البريد."
        actions={
          <Button variant="accent" icon={<Plus className="size-4" weight="bold" />} onClick={() => setEditing("new")}>
            إضافة حساب
          </Button>
        }
      />
      {body}
      {editing !== null && (
        // Keyed by account so opening another one starts from its own values
        <AdminUserFormDialog
          key={editing === "new" ? "new" : editing.id}
          target={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
