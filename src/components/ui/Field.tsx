"use client";

import { createContext, useContext, useId, type ReactNode } from "react";
import { WarningCircle } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";

type FieldControl = {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
  disabled: boolean | undefined;
  required: boolean | undefined;
};

const FieldContext = createContext<FieldControl | null>(null);

/** Read by Input / Textarea to wire id, aria-describedby and aria-invalid automatically. */
export function useFieldControl() {
  return useContext(FieldContext);
}

type FieldProps = {
  label: ReactNode;
  /** Already-translated error text (from applyFieldErrors). */
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
};

export function Field({ label, error, hint, required, disabled, id, className, children }: FieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={controlId} className={cn("text-sm font-medium text-fg", disabled && "text-fg-muted")}>
        {label}
        {required && (
          <span className="ms-0.5 text-danger" aria-hidden>
            *
          </span>
        )}
      </label>

      <FieldContext value={{ id: controlId, describedBy, invalid: Boolean(error), disabled, required }}>
        {children}
      </FieldContext>

      {hint && (
        <p id={hintId} className="text-sm text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-center gap-1 text-sm text-danger">
          <WarningCircle aria-hidden className="size-4 shrink-0" weight="fill" />
          {error}
        </p>
      )}
    </div>
  );
}
