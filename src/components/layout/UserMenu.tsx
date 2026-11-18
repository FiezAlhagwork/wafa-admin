"use client";

import { CaretUpDown, SignOut } from "@phosphor-icons/react";
import { Avatar, Badge, Menu, MenuItem, MenuSeparator } from "@/components/ui";
import { useSignOut } from "@/features/auth/hooks";
import { useAdmin } from "@/lib/auth/admin-provider";
import { roleLabels } from "@/lib/auth/roles";
import { cn } from "@/lib/cn";

/** The signed-in admin at the bottom of the dark sidebar: name, role, and a menu with the email and sign-out. */
export function UserMenu({ collapsed = false }: { collapsed?: boolean }) {
  const { user } = useAdmin();
  const { signOut, pending } = useSignOut();
  const name = user.name.trim() || user.email;

  return (
    <Menu
      side="top"
      align="start"
      trigger={
        <button
          type="button"
          aria-label="قائمة الحساب"
          className={cn(
            "flex w-full items-center gap-3 rounded-xl p-2 text-start transition-colors outline-none",
            "hover:bg-sidebar-hover focus-visible:ring-2 focus-visible:ring-amber data-popup-open:bg-sidebar-active",
            collapsed && "justify-center p-1.5",
          )}
        >
          <Avatar name={name} seed={1} size="sm" className="rounded-full ring-2 ring-neutral-0/10" />
          {!collapsed && (
            <>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-bold text-neutral-0">{user.name}</span>
                <span className="truncate text-xs text-sidebar-muted">{roleLabels[user.role]}</span>
              </span>
              <CaretUpDown aria-hidden className="size-4 shrink-0 text-sidebar-muted" />
            </>
          )}
        </button>
      }
    >
      <div className="flex flex-col items-start gap-1 px-3 py-2">
        <p className="text-sm font-semibold text-fg">{user.name}</p>
        <bdi dir="ltr" className="text-xs text-fg-muted">
          {user.email}
        </bdi>
        <Badge tone="brand" className="mt-1">
          {roleLabels[user.role]}
        </Badge>
      </div>
      <MenuSeparator />
      <MenuItem icon={<SignOut className="rtl:-scale-x-100" />} disabled={pending} onClick={signOut}>
        تسجيل الخروج
      </MenuItem>
    </Menu>
  );
}
