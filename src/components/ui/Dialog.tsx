"use client";

import type { ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";
import { Button, type ButtonProps } from "./Button";
import { IconButton } from "./IconButton";
import { popupMotion, sheetMotion } from "./styles";

type DialogSize = "sm" | "md" | "lg" | "xl";

const sizes: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
};

type DialogShellProps = {
  title: ReactNode;
  description?: ReactNode;
  size?: DialogSize;
  /**
   * On small screens the dialog becomes a sheet sliding up from the bottom (at most 88% of the height, so the page
   * stays visible above it) instead of a centered box; from `sm` up it is the usual centered dialog.
   */
  sheet?: boolean;
  /** Buttons, laid out on the end side. */
  footer?: ReactNode;
  closeButton?: boolean;
  className?: string;
  children?: ReactNode;
};

/**
 * Portal + backdrop + popup layout shared by Dialog and ConfirmDialog.
 * AlertDialog re-exports Dialog's parts, so these work under either Root.
 */
export function DialogShell({
  title,
  description,
  size = "md",
  sheet = false,
  footer,
  closeButton = true,
  className,
  children,
}: DialogShellProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-ink/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <BaseDialog.Viewport
        className={cn("fixed inset-0 z-50 flex justify-center", sheet ? "items-end sm:items-center sm:p-4" : "items-center p-4")}
      >
        <BaseDialog.Popup
          className={cn(
            "flex max-h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-dialog outline-none",
            sheet ? [sheetMotion, "max-h-[88dvh] max-sm:rounded-b-none max-sm:border-b-0 sm:max-h-full"] : popupMotion,
            sizes[size],
            className,
          )}
        >
          {sheet && <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-neutral-300 sm:hidden" />}
          <div className={cn("flex items-start gap-4 px-6 pt-6 pb-4", sheet && "max-sm:pt-3")}>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <BaseDialog.Title className="text-lg font-bold text-fg">{title}</BaseDialog.Title>
              {description && (
                <BaseDialog.Description className="text-sm leading-relaxed text-fg-muted">{description}</BaseDialog.Description>
              )}
            </div>
            {closeButton && (
              <BaseDialog.Close
                render={<IconButton label="إغلاق" icon={<X className="size-5" />} size="sm" className="-me-2 -mt-1" />}
              />
            )}
          </div>

          {children && <div className="min-h-0 overflow-y-auto px-6 pb-5">{children}</div>}

          {footer && (
            <div
              className={cn(
                "flex flex-wrap items-center justify-end gap-2 border-t border-border bg-neutral-50 px-6 py-4",
                // Keep the buttons clear of the phone's home indicator
                sheet && "max-sm:pb-[max(1rem,env(safe-area-inset-bottom))]",
              )}
            >
              {footer}
            </div>
          )}
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
}

type DialogProps = Omit<DialogShellProps, "closeButton"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * `false` while an action runs: hides the X and ignores Esc / outside clicks.
   * @default true
   */
  dismissible?: boolean;
};

export function Dialog({ open, onOpenChange, dismissible = true, ...shell }: DialogProps) {
  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && !dismissible) return;
        onOpenChange(next);
      }}
      disablePointerDismissal={!dismissible}
    >
      <DialogShell closeButton={dismissible} {...shell} />
    </BaseDialog.Root>
  );
}

/** A footer button that closes the dialog (e.g. "إلغاء"). Secondary by default. */
export function DialogClose({ variant = "secondary", ...props }: ButtonProps) {
  return <BaseDialog.Close render={<Button variant={variant} {...props} />} />;
}
