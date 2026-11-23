"use client";

import { CaretUpDown, SignOut } from "@phosphor-icons/react";
import { Avatar, Badge, Menu, MenuItem, MenuSeparator } from "@/components/ui";
import { useSignOut } from "@/features/auth/hooks";
import { useAdmin } from "@/lib/auth/admin-provider";
import { roleLabels } from "@/lib/auth/roles";
import { cn } from "@/lib/cn";
import { railFade } from "./rail";

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
          aria-label={collapsed ? `${user.name}، ${roleLabels[user.role]}` : undefined}
          // Same start padding open or folded: the avatar stays centred on the rail while the column folds (see rail.ts)
          className={cn(
            "flex w-full items-center gap-3 overflow-hidden rounded-xl p-1.5 text-start transition-colors outline-none",
            "hover:bg-sidebar-hover focus-visible:ring-2 focus-visible:ring-amber data-popup-open:bg-sidebar-active",
          )}
        >
          <Avatar name={name} seed={user.id} size="sm" className="shrink-0 rounded-full ring-2 ring-neutral-0/10" />
          {/* A fixed width (the open row's room), so folding clips it instead of squeezing it into "…" */}
          <span className={cn("flex w-38 shrink-0 flex-col", railFade(collapsed))}>
            <span className="truncate text-sm font-bold text-neutral-0">{user.name}</span>
            <span className="truncate text-xs text-sidebar-muted">{roleLabels[user.role]}</span>
          </span>
          <CaretUpDown aria-hidden className={cn("ms-auto size-4 shrink-0 text-sidebar-muted", railFade(collapsed))} />
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
