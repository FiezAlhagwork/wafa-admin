import { buttonVariants, type ButtonVariant } from "@/components/ui/Button";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

/** Links styled as large buttons (the ui Button renders a <button>, these are <a>). */
export function linkButton(variant: ButtonVariant, className?: string) {
  return cn(
    "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg px-5 text-base font-medium whitespace-nowrap transition-colors select-none [&>svg]:size-5",
    focusRing,
    buttonVariants[variant],
    className,
  );
}
