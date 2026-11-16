"use client";

import { SignOut } from "@phosphor-icons/react";
import { Badge, Button, Menu, MenuItem, MenuSeparator } from "@/components/ui";
import { useSignOut } from "@/features/auth/hooks";
import { useAdmin } from "@/lib/auth/admin-provider";
import { roleLabels } from "@/lib/auth/roles";

/** The signed-in admin: name, email, role and the sign-out action. */
export function UserMenu() {
  const { user } = useAdmin();
  const { signOut, pending } = useSignOut();
  const initial = (user.name.trim() || user.email).charAt(0).toUpperCase();

  return (
    <Menu
      trigger={
        <Button variant="ghost" size="sm" className="ps-1.5" aria-label="قائمة الحساب">
          <span
            aria-hidden
            className="flex size-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-on"
          >
            {initial}
          </span>
          <span className="hidden max-w-36 truncate sm:inline">{user.name}</span>
        </Button>
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
