import { buttonVariants, type ButtonVariant } from "@/components/ui/Button";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

const sizes = {
  md: "h-10 gap-2 px-4 text-sm [&>svg]:size-4",
  lg: "h-12 gap-2 px-5 text-base [&>svg]:size-5",
};

/** Links styled as buttons (the ui Button renders a <button>, these are <a>). */
export function linkButton(variant: ButtonVariant, className?: string, size: keyof typeof sizes = "lg") {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors select-none",
    focusRing,
    buttonVariants[variant],
    sizes[size],
    className,
  );
}

/**
 * Hero call-to-action links: a dark outline with a solid offset shadow that presses in on hover.
 * `accent` is the one highlighted action, `plain` the secondary one.
 */
export function ctaButton(variant: "accent" | "plain", className?: string) {
  return cn(
    "inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-ink px-8 text-lg font-bold whitespace-nowrap select-none",
    "shadow-[4px_4px_0_var(--color-ink)] transition-all duration-150",
    "hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-ink)]",
    "active:translate-x-1 active:translate-y-1 active:shadow-none",
    "motion-reduce:transition-none [&>svg]:size-5",
    focusRing,
    variant === "accent" ? "bg-amber text-ink" : "bg-surface text-ink",
    className,
  );
}
