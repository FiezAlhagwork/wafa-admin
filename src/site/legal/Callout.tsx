import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CalloutTone = "brand" | "warning" | "success" | "neutral";

const tones: Record<CalloutTone, { box: string; icon: string }> = {
  brand: { box: "border-brand/20 bg-brand-soft", icon: "text-brand" },
  warning: { box: "border-warning/25 bg-warning-soft", icon: "text-warning" },
  success: { box: "border-success/20 bg-success-soft", icon: "text-success" },
  neutral: { box: "border-border bg-neutral-50", icon: "text-fg-muted" },
};

type CalloutProps = {
  tone?: CalloutTone;
  icon?: ReactNode;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Callout({ tone = "neutral", icon, title, children, className }: CalloutProps) {
  return (
    <div className={cn("flex gap-3 rounded-xl border p-4 sm:p-5", tones[tone].box, className)}>
      {icon && (
        <span aria-hidden className={cn("mt-1 shrink-0 [&>svg]:size-5", tones[tone].icon)}>
          {icon}
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-1 leading-7 text-fg">
        {title && <p className="font-bold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
