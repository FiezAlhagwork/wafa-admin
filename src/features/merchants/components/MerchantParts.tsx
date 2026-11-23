import { Avatar, Latin, StatusBadge } from "@/components/ui";
import type { AdminMerchant } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatDate, formatRelativeDays } from "@/lib/format";
import { registrationStepLabels } from "../labels";

// The table (large screens) and the card (small ones) show the same facts. They live here once.

type MerchantProps = { merchant: AdminMerchant; className?: string };

type IdentityProps = MerchantProps & {
  /** The name as the row's button (the table): the whole row opens the merchant. */
  onOpen?: () => void;
};

/** Logo (or initials), business name, owner and type. A deleted merchant has no owner name any more: a dash. */
export function MerchantIdentity({ merchant, onOpen, className }: IdentityProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <Avatar name={merchant.business_name} src={merchant.logo_url} seed={merchant.id} />
      <div className="flex min-w-0 flex-col gap-0.5">
        {onOpen ? (
          // Stretched over the row (the row is `relative`): one real button per row, the row is its hit area
          <button
            type="button"
            onClick={onOpen}
            className="truncate text-start font-bold text-fg outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline"
          >
            {merchant.business_name}
          </button>
        ) : (
          <span className="truncate font-bold text-fg">{merchant.business_name}</span>
        )}
        <span className="truncate text-[13px] text-fg-muted">
          {merchant.owner_name ?? "—"} · {merchant.business_type.name}
        </span>
      </div>
    </div>
  );
}

/** Email and phone, both left-to-right text. Either can be missing (a deleted merchant has neither). */
export function MerchantContact({ merchant, className }: MerchantProps) {
  if (!merchant.email && !merchant.phone) return <span className="text-fg-muted">—</span>;

  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      {merchant.email && <Latin className="text-fg">{merchant.email}</Latin>}
      {merchant.phone && <Latin className="text-xs text-fg-muted">{merchant.phone}</Latin>}
    </div>
  );
}

/** The status, or for a merchant still registering (no status yet) where the registration stopped. */
export function MerchantStatus({ merchant, className }: MerchantProps) {
  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <StatusBadge status={merchant.status} />
      {merchant.status === null && (
        <span className="text-xs text-fg-muted">{registrationStepLabels[merchant.registration_step]}</span>
      )}
    </div>
  );
}

/** The current package (or the last one) and when the subscription ends. */
export function MerchantPackage({ merchant, className }: MerchantProps) {
  if (!merchant.package) return <span className="text-fg-muted">—</span>;

  return (
    <div className={cn("flex flex-col", className)}>
      <span className="font-bold text-fg">{merchant.package.name}</span>
      {merchant.subscription_ends_at && (
        <span className="text-xs whitespace-nowrap text-fg-muted">ينتهي {formatDate(merchant.subscription_ends_at)}</span>
      )}
    </div>
  );
}

/** "منذ 3 أيام" with the date under it. */
export function RegisteredAt({ merchant, className }: MerchantProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="whitespace-nowrap text-fg">{formatRelativeDays(merchant.registered_at)}</span>
      <span className="text-xs whitespace-nowrap text-fg-muted">{formatDate(merchant.registered_at)}</span>
    </div>
  );
}
