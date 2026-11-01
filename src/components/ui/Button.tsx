import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";
import { focusRing } from "./styles";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-brand-on hover:bg-brand-hover active:bg-brand-pressed",
  /** The one highlighted action on a screen. Text on amber is always ink. */
  accent: "bg-amber text-ink hover:bg-amber-hover active:bg-amber-pressed",
  secondary: "border border-border-strong bg-surface text-fg hover:bg-neutral-50 active:bg-neutral-100",
  ghost: "text-fg hover:bg-neutral-100 active:bg-neutral-200",
  danger: "bg-danger text-neutral-0 hover:bg-danger/90 active:bg-danger/80",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-sm",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-5 text-base",
};

export type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks clicks, keeping the button's width. */
  loading?: boolean;
  /** Icon before the text (on the start side in RTL). */
  icon?: ReactNode;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  type = "button",
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors select-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        loading && "disabled:cursor-wait disabled:opacity-100",
        focusRing,
        buttonVariants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      <span className={cn("inline-flex items-center gap-[inherit]", loading && "invisible")}>
        {icon}
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={size === "lg" ? "md" : "sm"} />
        </span>
      )}
    </button>
  );
}
