import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { buttonVariants, type ButtonSize, type ButtonVariant } from "./Button";
import { Spinner } from "./Spinner";
import { focusRing } from "./styles";

const sizes: Record<ButtonSize, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

type IconButtonProps = Omit<ComponentProps<"button">, "children"> & {
  /**
   * Required: an icon-only button has no visible text, so this is its accessible name.
   * For a visible hint, wrap the button in <Tooltip>.
   */
  label: string;
  icon: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function IconButton({
  label,
  icon,
  variant = "ghost",
  size = "md",
  loading = false,
  type = "button",
  disabled,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg transition-colors select-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        loading && "disabled:cursor-wait disabled:opacity-100",
        focusRing,
        buttonVariants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size={size === "lg" ? "md" : "sm"} /> : icon}
    </button>
  );
}
