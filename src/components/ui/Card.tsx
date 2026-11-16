import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = ComponentProps<"div"> & {
  /** Amber bar on the start side for a featured card (e.g. the default package). */
  highlight?: boolean;
};

export function Card({ highlight = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-surface", highlight && "border-s-4 border-s-amber", className)}
      {...props}
    />
  );
}

type CardHeaderProps = Omit<ComponentProps<"div">, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons on the end side of the header. */
  actions?: ReactNode;
};

export function CardHeader({ title, description, actions, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-border px-4 py-3", className)} {...props}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        {/* A div, not a p: the description can be a Skeleton (a div) while data loads */}
        {description && <div className="text-xs text-fg-muted">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-4", className)} {...props} />;
}
