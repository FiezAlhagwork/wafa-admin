import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A fact under a record's name (type, place, dates): an icon and a short text on a soft pill. */
export function MetaPill({ icon, className, children }: { icon: ReactNode; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full bg-neutral-50 px-3 text-[13.5px] text-neutral-700 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-fg-muted",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
