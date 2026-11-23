import { Avatar, Badge, Latin, StatusBadge } from "@/components/ui";
import type { AdminUser } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatDate, formatRelativeDays, formatTime } from "@/lib/format";
import { roleLabels } from "@/lib/auth/roles";

// The table (large screens) and the card (small ones) show the same facts. They live here once.

type UserProps = { user: AdminUser; className?: string };

/** Name and email. `isSelf` marks the signed-in account, which can't change its own role or be deactivated. */
export function AdminUserIdentity({ user, isSelf = false, className }: UserProps & { isSelf?: boolean }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <Avatar name={user.name || user.email} seed={user.id} className="rounded-full" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span className="truncate font-bold text-fg">{user.name}</span>
          {isSelf && <Badge tone="amber">أنت</Badge>}
        </span>
        <Latin className="text-[13px] text-fg-muted">{user.email}</Latin>
      </div>
    </div>
  );
}

/** For display only: what the role can do comes from `permissions`, never from this label. */
export function RoleBadge({ user, className }: UserProps) {
  return (
    <Badge tone="brand" className={className}>
      {roleLabels[user.role]}
    </Badge>
  );
}

/** Deactivated wins over "not linked yet": a deactivated account can't sign in whatever its link state. */
export function AdminUserStatus({ user, className }: UserProps) {
  const status = !user.is_active ? "admin_inactive" : !user.linked ? "admin_invited" : "ACTIVE";
  return <StatusBadge status={status} className={className} />;
}

/** "14 نوفمبر 2026 · 9:20 ص" with how long ago under it, or that the account never signed in. */
export function LastLogin({ user, className }: UserProps) {
  if (!user.last_login_at) return <span className={cn("text-fg-muted", className)}>لم يدخل بعد</span>;

  return (
    <div className={cn("flex flex-col", className)}>
      <span className="whitespace-nowrap text-fg">{formatRelativeDays(user.last_login_at)}</span>
      <span className="text-xs whitespace-nowrap text-fg-muted">
        {formatDate(user.last_login_at)} · {formatTime(user.last_login_at)}
      </span>
    </div>
  );
}
