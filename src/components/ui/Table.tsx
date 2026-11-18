import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Skeleton } from "./Skeleton";

type TableProps = ComponentProps<"table"> & {
  /** Inside a Card that already draws the surface: no frame of its own. */
  bare?: boolean;
};

/**
 * A data table on the same surface as a Card, scrolling sideways when it doesn't fit.
 * Empty / error states are not part of it: render EmptyState or ErrorState instead of the Table.
 */
export function Table({ bare = false, className, ...props }: TableProps) {
  return (
    <div className={cn("overflow-x-auto", !bare && "rounded-2xl border border-ink/6 bg-surface shadow-card")}>
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}

export function TableHead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("bg-neutral-50", className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("divide-y divide-divider", className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("transition-colors hover:bg-neutral-50/70", className)} {...props} />;
}

export function TableHeaderCell({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn("h-11 px-4 text-start text-[13px] font-medium whitespace-nowrap text-fg-muted first:ps-5 last:pe-5", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-4 py-3.5 align-middle text-fg first:ps-5 last:pe-5", className)} {...props} />;
}

/** Placeholder rows while the first page loads. Goes inside TableBody. */
export function TableSkeletonRows({ rows = 5, columns }: { rows?: number; columns: number }) {
  return Array.from({ length: rows }, (_, row) => (
    <tr key={row} aria-hidden>
      {Array.from({ length: columns }, (_, column) => (
        <td key={column} className="px-4 py-4 first:ps-5 last:pe-5">
          <Skeleton className="h-4 w-full max-w-32" />
        </td>
      ))}
    </tr>
  ));
}
