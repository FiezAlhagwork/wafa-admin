"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./Field";
import { controlBase, controlBorder } from "./styles";

type TextareaProps = ComponentProps<"textarea"> & {
  /** Set automatically inside a Field with an error. */
  invalid?: boolean;
};

export function Textarea({
  invalid,
  id,
  disabled,
  required,
  rows = 4,
  "aria-describedby": describedBy,
  className,
  ...props
}: TextareaProps) {
  const field = useFieldControl();
  const isInvalid = invalid ?? field?.invalid ?? false;

  return (
    <textarea
      id={id ?? field?.id}
      disabled={disabled ?? field?.disabled}
      required={required ?? field?.required}
      rows={rows}
      aria-invalid={isInvalid || undefined}
      aria-describedby={describedBy ?? field?.describedBy}
      className={cn(controlBase, controlBorder(isInvalid), "min-h-20 resize-y px-3 py-2 leading-relaxed", className)}
      {...props}
    />
  );
}
