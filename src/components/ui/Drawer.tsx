"use client";

import type { ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cn } from "@/lib/cn";

type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible name of the panel (screen readers only; the content brings its own visible heading). */
  label: string;
  className?: string;
  children: ReactNode;
};

// Slides from the start side (right in RTL). Esc, the backdrop and the focus trap come from Base UI's dialog.
const slide = "ltr:data-starting-style:-translate-x-full rtl:data-starting-style:translate-x-full";
const slideOut = "ltr:data-ending-style:-translate-x-full rtl:data-ending-style:translate-x-full";

/** Side panel for the sidebar on small screens. */
export function Drawer({ open, onOpenChange, label, className, children }: DrawerProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-ink/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <BaseDialog.Popup
          className={cn(
            "fixed inset-y-0 start-0 z-40 flex w-72 max-w-[85vw] flex-col bg-surface shadow-dialog outline-none",
            "transition-transform duration-200 ease-out motion-reduce:transition-none",
            slide,
            slideOut,
            className,
          )}
        >
          <BaseDialog.Title className="sr-only">{label}</BaseDialog.Title>
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
