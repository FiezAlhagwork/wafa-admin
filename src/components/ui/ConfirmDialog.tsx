"use client";

import type { ReactNode } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "./Button";
import { DialogShell } from "./Dialog";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** `danger` for destructive actions (delete, suspend). */
  tone?: "primary" | "danger";
  /** Usually `mutation.isPending`. While true the dialog can't be closed. */
  loading?: boolean;
  /**
   * Does not close the dialog: close it from the mutation's onSuccess,
   * so it stays open (with the user's context) if the request fails.
   */
  onConfirm: () => void;
  /** Extra content, e.g. `stats.rewards_ready` before deleting a merchant. */
  children?: ReactNode;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "إلغاء",
  tone = "primary",
  loading = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && loading) return;
        onOpenChange(next);
      }}
    >
      <DialogShell
        size="sm"
        title={title}
        description={description}
        closeButton={false}
        footer={
          <>
            <AlertDialog.Close render={<Button variant="secondary" disabled={loading} />}>{cancelLabel}</AlertDialog.Close>
            <Button variant={tone} loading={loading} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </>
        }
      >
        {children}
      </DialogShell>
    </AlertDialog.Root>
  );
}
