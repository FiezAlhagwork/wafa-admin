import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "brand" | "amber" | "success" | "warning" | "danger" | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-neutral-100 text-neutral-700",
  brand: "bg-brand-soft text-brand",
  /** Highlights only ("most popular", stamp counts). Never a status. */
  amber: "bg-amber-soft text-ink [&>svg]:text-amber-pressed",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

type BadgeProps = ComponentProps<"span"> & {
  tone?: BadgeTone;
  /** Small colored dot before the text. */
  dot?: boolean;
  icon?: ReactNode;
};

export function Badge({ tone = "neutral", dot = false, icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap [&>svg]:size-3.5",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          className={cn("size-1.5 shrink-0 rounded-full", tone === "amber" ? "bg-amber-pressed" : "bg-current")}
        />
      )}
      {icon}
      {children}
    </span>
  );
}
