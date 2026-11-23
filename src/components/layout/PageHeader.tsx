import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  /** Beside the title (a count or a StatusBadge). */
  meta?: ReactNode;
  /** Buttons on the end side (the one highlighted action is an accent Button). */
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, meta, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[26px] leading-tight font-black tracking-tight text-fg sm:text-3xl">{title}</h1>
          {meta}
        </div>
        {description && <p className="text-[15px] text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
