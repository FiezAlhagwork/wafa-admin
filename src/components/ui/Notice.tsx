import type { ReactNode } from "react";
import { Info, Warning } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";

type NoticeProps = {
  /** `warning` for what the admin should think twice about (the effect of a suspension, an old registration). */
  tone?: "info" | "warning";
  className?: string;
  children: ReactNode;
};

/** A short note inside a dialog or a card: what an action will do, or a rule to keep in mind. */
export function Notice({ tone = "info", className, children }: NoticeProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm leading-relaxed text-fg",
        tone === "warning" ? "bg-warning-soft" : "bg-neutral-50",
        className,
      )}
    >
      {tone === "warning" ? (
        <Warning aria-hidden weight="fill" className="mt-0.5 size-4.5 shrink-0 text-warning" />
      ) : (
        <Info aria-hidden weight="fill" className="mt-0.5 size-4.5 shrink-0 text-fg-muted" />
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
