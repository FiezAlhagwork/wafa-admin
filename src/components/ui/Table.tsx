import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Skeleton } from "./Skeleton";

/**
 * A plain data table inside a bordered, horizontally scrollable frame. Put it in a Card or alone.
 * Empty / error states are not part of it: render EmptyState or ErrorState instead of the Table.
 */
export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}

export function TableHead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("border-b border-border bg-neutral-50", className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("divide-y divide-border", className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("transition-colors hover:bg-neutral-50", className)} {...props} />;
}

export function TableHeaderCell({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn("h-10 px-4 text-start text-xs font-medium whitespace-nowrap text-fg-muted", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-middle text-fg", className)} {...props} />;
}

/** Placeholder rows while the first page loads. Goes inside TableBody. */
export function TableSkeletonRows({ rows = 5, columns }: { rows?: number; columns: number }) {
  return Array.from({ length: rows }, (_, row) => (
    <tr key={row} aria-hidden>
      {Array.from({ length: columns }, (_, column) => (
        <td key={column} className="px-4 py-3.5">
          <Skeleton className="h-4 w-full max-w-32" />
        </td>
      ))}
    </tr>
  ));
}
