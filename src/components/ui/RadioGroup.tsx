"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { cn } from "@/lib/cn";
import { focusRing } from "./styles";

export type RadioOption<T extends string> = {
  value: T;
  label: string;
  /** A short line under the label. */
  description?: string;
};

type RadioGroupProps<T extends string> = {
  /** `null` = nothing chosen yet. */
  value: T | null;
  onValueChange: (value: T) => void;
  options: RadioOption<T>[];
  /** Accessible name of the group (what is being chosen). */
  label: string;
  disabled?: boolean;
  className?: string;
};

/** A short list of exclusive choices, each a full-width row you can click anywhere on. */
export function RadioGroup<T extends string>({
  value,
  onValueChange,
  options,
  label,
  disabled = false,
  className,
}: RadioGroupProps<T>) {
  return (
    <BaseRadioGroup<T | "">
      // Base UI has no "nothing chosen" null: an empty string is a controlled group with no selected radio
      value={value ?? ""}
      onValueChange={(next) => {
        if (next !== "") onValueChange(next);
      }}
      disabled={disabled}
      aria-label={label}
      className={cn("flex flex-col gap-2", className)}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors",
            "hover:bg-neutral-50 has-data-checked:border-brand has-data-checked:bg-brand-soft",
            "has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50",
          )}
        >
          <Radio.Root
            value={option.value}
            className={cn(
              "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border-2 border-border-input bg-surface transition-colors",
              "data-checked:border-brand",
              focusRing,
            )}
          >
            <Radio.Indicator className="size-2 rounded-full bg-brand" />
          </Radio.Root>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-medium text-fg">{option.label}</span>
            {option.description && <span className="text-xs text-fg-muted">{option.description}</span>}
          </span>
        </label>
      ))}
    </BaseRadioGroup>
  );
}
