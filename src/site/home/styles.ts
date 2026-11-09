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
