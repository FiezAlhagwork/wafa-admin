"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import { CaretDown, Check } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./Field";
import { controlBase, controlBorder, popupMotion, popupSurface } from "./styles";

export type SelectOption<T extends string> = { value: T; label: string };

type SelectProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: SelectOption<T>[];
  /** Accessible name when there is no visible label (a filter next to a search box, for example). */
  label?: string;
  /** Shown when `value` matches no option. */
  placeholder?: string;
  disabled?: boolean;
  /** Set automatically inside a Field with an error. */
  invalid?: boolean;
  className?: string;
};

/**
 * A short list of choices in a dropdown. Use RadioGroup when there are few and each needs a description,
 * Tabs for a few views of the same list, and this for filters and longer lists. `value` is always one of the options:
 * a "no filter" choice is an option too (usually with value `""`).
 */
export function Select<T extends string>({
  value,
  onValueChange,
  options,
  label,
  placeholder,
  disabled,
  invalid,
  className,
}: SelectProps<T>) {
  const field = useFieldControl();
  const isInvalid = invalid ?? field?.invalid ?? false;
  // A value that matches no option shows the placeholder (Base UI would print the raw value)
  const selected = options.some((option) => option.value === value);

  return (
    <BaseSelect.Root
      value={selected ? value : null}
      onValueChange={(next) => {
        if (next !== null) onValueChange(next);
      }}
      items={options}
      disabled={disabled ?? field?.disabled}
    >
      <BaseSelect.Trigger
        id={field?.id}
        aria-label={label}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        className={cn(
          controlBase,
          controlBorder(isInvalid),
          "flex h-10.5 cursor-pointer items-center justify-between gap-2 px-3 text-start data-popup-open:border-brand data-popup-open:ring-3 data-popup-open:ring-brand/15",
          className,
        )}
      >
        <BaseSelect.Value placeholder={placeholder} className="truncate data-placeholder:text-fg-subtle" />
        <BaseSelect.Icon className="shrink-0 text-fg-muted transition-transform data-popup-open:rotate-180">
          <CaretDown aria-hidden className="size-4" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>

      <BaseSelect.Portal>
        <BaseSelect.Positioner
          alignItemWithTrigger={false}
          sideOffset={6}
          align="start"
          className="z-50 outline-none"
        >
          <BaseSelect.Popup
            className={cn(
              popupSurface,
              popupMotion,
              "max-h-72 min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto p-1",
            )}
          >
            <BaseSelect.List>
              {options.map((option) => (
                <BaseSelect.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    "flex h-9 cursor-default items-center justify-between gap-3 rounded-lg ps-3 pe-2 text-sm text-fg outline-none select-none",
                    "data-highlighted:bg-neutral-100 data-selected:font-semibold data-disabled:pointer-events-none data-disabled:text-fg-subtle",
                  )}
                >
                  <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator className="text-brand">
                    <Check aria-hidden className="size-4" weight="bold" />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
