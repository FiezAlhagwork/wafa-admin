"use client";

import { OTPField } from "@base-ui/react/otp-field";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./Field";
import { controlBase, controlBorder } from "./styles";

type OtpFieldProps = {
  value: string;
  onValueChange: (value: string) => void;
  /** Fires once every box is filled (e.g. submit the code). */
  onComplete?: (value: string) => void;
  length?: number;
  /** Set automatically inside a Field with an error. */
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
};

/** One-time code boxes. Always LTR, digits only, and the browser can autofill it from SMS/email. */
export function OtpField({
  value,
  onValueChange,
  onComplete,
  length = 6,
  invalid,
  disabled,
  autoFocus,
  className,
}: OtpFieldProps) {
  const field = useFieldControl();
  const isInvalid = invalid ?? field?.invalid ?? false;

  return (
    <OTPField.Root
      id={field?.id}
      dir="ltr"
      length={length}
      value={value}
      onValueChange={(next) => onValueChange(next)}
      onValueComplete={(next) => onComplete?.(next)}
      validationType="numeric"
      inputMode="numeric"
      autoComplete="one-time-code"
      disabled={disabled ?? field?.disabled}
      aria-describedby={field?.describedBy}
      aria-invalid={isInvalid || undefined}
      className={cn("flex gap-2", className)}
    >
      {Array.from({ length }, (_, index) => (
        <OTPField.Input
          key={index}
          autoFocus={autoFocus && index === 0}
          aria-label={index === 0 ? undefined : `الخانة ${index + 1} من ${length}`}
          className={cn(controlBase, controlBorder(isInvalid), "size-12 p-0 text-center text-xl font-bold tabular-nums")}
        />
      ))}
    </OTPField.Root>
  );
}
