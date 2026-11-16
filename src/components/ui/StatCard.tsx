import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card } from "./Card";
import { Skeleton } from "./Skeleton";

type StatCardProps = {
  label: string;
  /** Already formatted (via lib/format.ts). */
  value: ReactNode;
  /** Small, gray, beside the label. Not a colored tile: the number is the star. */
  icon?: ReactNode;
  hint?: ReactNode;
  /**
   * `warning`: counts that need attention (overdue payments, trials ending...): the number turns warning.
   * `accent`: the one headline number on a screen: a small amber bar beside it.
   */
  tone?: "default" | "accent" | "warning";
  loading?: boolean;
  className?: string;
};

export function StatCard({ label, value, icon, hint, tone = "default", loading = false, className }: StatCardProps) {
  return (
    <Card className={cn("flex min-w-0 flex-col gap-1.5 p-4", className)} aria-busy={loading || undefined}>
      <span className="flex items-center gap-1.5 text-xs text-fg-muted">
        {icon && (
          <span aria-hidden className="text-fg-subtle [&>svg]:size-4">
            {icon}
          </span>
        )}
        {label}
      </span>

      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <span className="flex items-center gap-2">
          {tone === "accent" && <span aria-hidden className="h-6 w-1 shrink-0 rounded-full bg-amber" />}
          <span className={cn("text-2xl font-semibold tabular-nums", tone === "warning" ? "text-warning" : "text-fg")}>
            {value}
          </span>
        </span>
      )}

      {hint && !loading && <span className="text-xs text-fg-muted">{hint}</span>}
    </Card>
  );
}
