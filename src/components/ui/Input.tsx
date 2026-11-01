"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./Field";
import { controlBase, controlBorder } from "./styles";

type InputProps = ComponentProps<"input"> & {
  /** Set automatically inside a Field with an error. */
  invalid?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};

export function Input({
  invalid,
  startIcon,
  endIcon,
  id,
  dir,
  disabled,
  required,
  "aria-describedby": describedBy,
  className,
  ...props
}: InputProps) {
  const field = useFieldControl();
  const isInvalid = invalid ?? field?.invalid ?? false;

  const input = (
    <input
      id={id ?? field?.id}
      dir={dir}
      disabled={disabled ?? field?.disabled}
      required={required ?? field?.required}
      aria-invalid={isInvalid || undefined}
      aria-describedby={describedBy ?? field?.describedBy}
      className={cn(
        controlBase,
        controlBorder(isInvalid),
        "h-10 px-3",
        startIcon && "ps-10",
        endIcon && "pe-10",
        className,
      )}
      {...props}
    />
  );

  if (!startIcon && !endIcon) return input;

  // Same dir as the input, so the icon and the input's padding land on the same side.
  return (
    <div className="relative" dir={dir}>
      {startIcon && (
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-fg-subtle [&>svg]:size-5">
          {startIcon}
        </span>
      )}
      {input}
      {endIcon && (
        <span className="absolute inset-y-0 end-3 flex items-center text-fg-subtle [&>svg]:size-5">{endIcon}</span>
      )}
    </div>
  );
}
