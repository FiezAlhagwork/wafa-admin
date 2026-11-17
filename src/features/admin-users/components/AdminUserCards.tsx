"use client";

import { CaretRight } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui";
import type { AdminUser } from "@/lib/api/types";
import { AdminUserIdentity, AdminUserStatus, LastLogin, RoleBadge } from "./AdminUserParts";

// The small-screen layout of the same list the table shows from `lg`. The whole card is the button (same as payments).

type AdminUserCardsProps = {
  users: AdminUser[];
  /** The signed-in account. */
  selfId: number;
  onOpen: (user: AdminUser) => void;
};

export function AdminUserCards({ users, selfId, onOpen }: AdminUserCardsProps) {
  return (
    <ul className="flex flex-col gap-3">
      {users.map((user) => (
        <li
          key={user.id}
          className="relative rounded-lg border border-border bg-surface transition-colors active:bg-neutral-100 has-focus-visible:ring-2 has-focus-visible:ring-focus has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-bg"
        >
          {/* The tap target covers the whole card; the content above it ignores the pointer so taps reach it */}
          <button
            type="button"
            onClick={() => onOpen(user)}
            aria-label={`تعديل حساب ${user.name}`}
            className="absolute inset-0 rounded-lg outline-none"
          />

          <div className="pointer-events-none flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <AdminUserIdentity user={user} isSelf={user.id === selfId} />
              <AdminUserStatus user={user} className="shrink-0" />
            </div>

            <RoleBadge user={user} className="self-start" />

            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <span className="flex flex-wrap items-baseline gap-x-2 text-sm">
                <span className="text-xs text-fg-muted">آخر دخول</span>
                <LastLogin user={user} />
              </span>
              <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand">
                تعديل
                <CaretRight aria-hidden className="size-4 rtl:-scale-x-100" />
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AdminUserCardsSkeleton() {
  return (
    <ul aria-hidden className="flex flex-col gap-3">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-12" />
          </div>
        </li>
      ))}
    </ul>
  );
}
