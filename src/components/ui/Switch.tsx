"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";
import { focusRing } from "./styles";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Accessible name: what is turned on or off (the visible text next to it, or a longer phrase). */
  label: string;
  disabled?: boolean;
  /** The change is being saved: the thumb shows a spinner and the switch takes no input. */
  loading?: boolean;
  className?: string;
};

/**
 * On/off for something that applies at once (no Save button). The thumb sits at the start when off and moves to
 * the end when on, so it follows the reading direction in RTL.
 */
export function Switch({ checked, onCheckedChange, label, disabled = false, loading = false, className }: SwitchProps) {
  return (
    <BaseSwitch.Root
      checked={checked}
      onCheckedChange={(next) => onCheckedChange(next)}
      disabled={disabled || loading}
      aria-label={label}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors",
        "bg-neutral-300 hover:bg-neutral-400 data-checked:bg-success data-checked:hover:bg-success/90",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        focusRing,
        className,
      )}
    >
      <BaseSwitch.Thumb
        className={cn(
          "flex size-5 items-center justify-center rounded-full bg-surface shadow-sm transition-transform duration-150",
          // RTL: "end" is the left, so the thumb moves by a negative amount
          "data-checked:translate-x-5 rtl:data-checked:-translate-x-5",
        )}
      >
        {loading && <Spinner size="sm" className="size-3 text-fg-muted" />}
      </BaseSwitch.Thumb>
    </BaseSwitch.Root>
  );
}
