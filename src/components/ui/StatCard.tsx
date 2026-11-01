import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card } from "./Card";
import { Skeleton } from "./Skeleton";

const iconTones = {
  default: "bg-brand-soft text-brand",
  accent: "bg-amber text-ink",
  warning: "bg-warning-soft text-warning",
};

type StatCardProps = {
  label: string;
  /** Already formatted (via lib/format.ts). */
  value: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  /**
   * `warning`: counts that need attention (overdue payments, trials ending...).
   * `accent`: the one headline number on a screen (amber icon).
   */
  tone?: "default" | "accent" | "warning";
  loading?: boolean;
  className?: string;
};

export function StatCard({ label, value, icon, hint, tone = "default", loading = false, className }: StatCardProps) {
  return (
    <Card className={cn("flex items-start gap-4 p-5", className)} aria-busy={loading || undefined}>
      {icon && (
        <span
          aria-hidden
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg [&>svg]:size-6",
            iconTones[tone],
          )}
        >
          {icon}
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-sm text-fg-muted">{label}</span>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <span className={cn("text-2xl font-bold tabular-nums", tone === "warning" ? "text-warning" : "text-fg")}>
            {value}
          </span>
        )}
        {hint && !loading && <span className="text-sm text-fg-muted">{hint}</span>}
      </div>
    </Card>
  );
}
