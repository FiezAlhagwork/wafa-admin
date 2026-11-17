import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Left-to-right text (an email, a reference) inside an Arabic layout. The block keeps the page's direction, so it lines
 * up with the lines around it; only the text inside is LTR. A bare `<bdi dir="ltr">` would take the LTR start (the left).
 */
export function Latin({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("block truncate", className)}>
      <bdi dir="ltr">{children}</bdi>
    </span>
  );
}
