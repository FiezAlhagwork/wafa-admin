import { Badge } from "@/components/ui";
import type { AdminCustomer, CustomerCycle } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

// Small facts written the same way on the search result, the customer page and the cycle dialog.

/** A customer stamped by phone before ever opening the app has no name yet. */
export const customerName = (customer: Pick<AdminCustomer, "name">) => customer.name ?? "زبون غير مسجّل";

export function RegisteredBadge({ customer }: { customer: Pick<AdminCustomer, "registered"> }) {
  return customer.registered ? (
    <Badge tone="success" dot>
      مسجّل
    </Badge>
  ) : (
    <Badge tone="neutral" dot>
      غير مسجّل
    </Badge>
  );
}

type CycleState = Pick<CustomerCycle, "status" | "redeemed_at">;

/** Collecting, the gift is ready, or the gift was given out (the end of a cycle). */
export function CycleStatusBadge({ cycle }: { cycle: CycleState }) {
  if (cycle.redeemed_at) return <Badge tone="neutral">سُلّمت الهدية {formatDate(cycle.redeemed_at)}</Badge>;
  if (cycle.status === "REWARD_READY") return <Badge tone="success">الهدية جاهزة</Badge>;
  return <Badge tone="info">يجمع الأختام</Badge>;
}

/** "3 / 8" with a bar: how far into the card. */
export function StampsProgress({
  count,
  required,
  className,
}: {
  count: number;
  required: number;
  className?: string;
}) {
  const percent = required > 0 ? Math.min(100, (count * 100) / required) : 0;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        role="progressbar"
        aria-label="الأختام"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={required}
        className="block h-2 flex-1 overflow-hidden rounded-full bg-neutral-100"
      >
        <span className="block h-full rounded-full bg-teal" style={{ width: `${percent}%` }} />
      </span>
      <span className="shrink-0 text-[13px] font-bold text-fg tabular-nums">
        <bdi dir="ltr">
          {count} / {required}
        </bdi>
      </span>
    </div>
  );
}
