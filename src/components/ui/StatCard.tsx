import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card, IconTile, type IconTone } from "./Card";
import { Skeleton } from "./Skeleton";

type StatCardProps = {
  label: string;
  /** Already formatted (via lib/format.ts). */
  value: ReactNode;
  /** Shown on a colored tile at the end of the label row. */
  icon?: ReactNode;
  iconTone?: IconTone;
  hint?: ReactNode;
  /**
   * `warning`: counts that need attention (overdue payments, trials ending...): the number turns warning.
   * `accent`: the one headline number on a screen: an ink card with the number in amber.
   */
  tone?: "default" | "accent" | "warning";
  loading?: boolean;
  className?: string;
};

export function StatCard({
  label,
  value,
  icon,
  iconTone = "brand",
  hint,
  tone = "default",
  loading = false,
  className,
}: StatCardProps) {
  const accent = tone === "accent";

  return (
    <Card
      className={cn("relative flex min-w-0 flex-col gap-3 overflow-hidden p-5", accent && "border-transparent bg-ink", className)}
      aria-busy={loading || undefined}
    >
      {/* A stamp ring in the corner of the headline card: the loyalty-card motif */}
      {accent && (
        <span
          aria-hidden
          className="pointer-events-none absolute -end-10 -bottom-12 size-36 rounded-full border-[14px] border-amber/25"
        />
      )}

      <span className="flex items-center justify-between gap-3">
        <span className={cn("text-sm font-medium", accent ? "text-neutral-0/75" : "text-neutral-700")}>{label}</span>
        {icon && !accent && <IconTile icon={icon} tone={iconTone} />}
      </span>

      {loading ? (
        <Skeleton className={cn("h-9 w-24", accent && "bg-neutral-0/15")} />
      ) : (
        <span
          className={cn(
            // Wraps (never truncates): a long amount like "16,191,500 ل.س" must stay readable in a narrow card
            "text-[28px] leading-tight font-black tabular-nums",
            accent ? "text-amber" : tone === "warning" ? "text-warning" : "text-fg",
          )}
        >
          {value}
        </span>
      )}

      {hint && !loading && (
        <span className={cn("text-[13px]", accent ? "text-neutral-0/75" : "text-fg-muted")}>{hint}</span>
      )}
    </Card>
  );
}
