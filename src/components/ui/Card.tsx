import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = ComponentProps<"div"> & {
  /** Amber bar on the start side for a featured card (e.g. the default package). */
  highlight?: boolean;
};

/** A white surface resting on the page: a soft shadow and a faint edge, not a hard border. */
export function Card({ highlight = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink/6 bg-surface shadow-card",
        highlight && "border-s-4 border-s-amber",
        className,
      )}
      {...props}
    />
  );
}

export type IconTone = "brand" | "teal" | "amber" | "info" | "warning" | "danger" | "neutral";

const iconTones: Record<IconTone, string> = {
  brand: "bg-brand-soft text-brand",
  teal: "bg-teal-soft text-success",
  amber: "bg-amber-soft text-ink",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-neutral-100 text-neutral-700",
};

/** An icon on a soft colored square: marks a section or a figure. Decorative. */
export function IconTile({
  icon,
  tone = "brand",
  size = "md",
  className,
}: {
  icon: ReactNode;
  tone?: IconTone;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center",
        size === "md" ? "size-9 rounded-xl [&>svg]:size-5" : "size-8 rounded-lg [&>svg]:size-4.5",
        iconTones[tone],
        className,
      )}
    >
      {icon}
    </span>
  );
}

type CardHeaderProps = Omit<ComponentProps<"div">, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  /** A section icon, shown on a colored tile before the title. */
  icon?: ReactNode;
  iconTone?: IconTone;
  /** Buttons or a link on the end side of the header. */
  actions?: ReactNode;
};

export function CardHeader({ title, description, icon, iconTone, actions, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("flex items-center justify-between gap-4 border-b border-divider px-5 py-4", className)}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-3">
        {icon && <IconTile icon={icon} tone={iconTone} />}
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-base font-bold text-fg">{title}</h2>
          {/* A div, not a p: the description can be a Skeleton (a div) while data loads */}
          {description && <div className="text-[13px] text-fg-muted">{description}</div>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-5", className)} {...props} />;
}
