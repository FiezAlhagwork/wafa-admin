"use client";

import { useState } from "react";
import { DeviceMobile, QrCode, XCircle } from "@phosphor-icons/react";
import { Dialog, DialogClose, ErrorState, Notice, ReasonOnlyDialog, Skeleton, toast } from "@/components/ui";
import { handleActionError } from "@/lib/api/action-errors";
import { getErrorMessage } from "@/lib/api/errors";
import type { AdminCardCycle, CycleStamp } from "@/lib/api/types";
import { usePermission } from "@/lib/auth/can";
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime } from "@/lib/format";
import { useCancelStamp, useCardCycle } from "../hooks";
import { CycleStatusBadge, StampsProgress } from "./CustomerParts";

const methodLabels: Record<CycleStamp["method"], string> = { qr: "مسح الرمز", phone: "برقم الهاتف" };

function StampRow({
  stamp,
  number,
  onCancel,
}: {
  stamp: CycleStamp;
  /** Its place among the stamps that count; cancelled ones have none. */
  number: number | null;
  onCancel?: () => void;
}) {
  const cancelled = stamp.cancelled_at !== null;
  const Icon = stamp.method === "qr" ? QrCode : DeviceMobile;

  return (
    <li className="flex gap-3.5">
      <span aria-hidden className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-black tabular-nums",
            cancelled ? "bg-danger-soft text-danger" : "bg-teal-soft text-success",
          )}
        >
          {cancelled ? <XCircle weight="bold" className="size-4" /> : number}
        </span>
        <span className="w-0.5 flex-1 bg-divider" />
      </span>

      <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-x-4 gap-y-1.5 pb-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className={cn("flex items-center gap-1.5 font-bold text-fg", cancelled && "text-fg-muted line-through")}>
            <Icon aria-hidden className="size-4 shrink-0 text-fg-muted" />
            {methodLabels[stamp.method]}
          </span>
          <span className="text-[13px] text-fg-muted">{formatDateTime(stamp.stamped_at)}</span>
          {stamp.cancelled_at && (
            <span className="text-[13px] text-danger">
              أُلغي {formatDate(stamp.cancelled_at)}
              {stamp.cancelled_by && ` بواسطة ${stamp.cancelled_by.name}`}
              {stamp.cancel_reason && ` · ${stamp.cancel_reason}`}
            </span>
          )}
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-8 cursor-pointer items-center rounded-lg px-2.5 text-[13px] font-bold text-danger transition-colors outline-none hover:bg-danger-soft focus-visible:ring-2 focus-visible:ring-focus"
          >
            إلغاء الطابع
          </button>
        )}
      </div>
    </li>
  );
}

function CycleBody({ cycle, onCancelStamp }: { cycle: AdminCardCycle; onCancelStamp?: (stamp: CycleStamp) => void }) {
  // The gift was given out: its stamps can't be cancelled (the server refuses with REWARD_ALREADY_REDEEMED)
  const cancellable = onCancelStamp && !cycle.redeemed_at;
  // Each stamp that counts gets its place (1, 2, 3…); a cancelled one gets none
  const places = cycle.stamps.reduce<number[]>(
    (acc, stamp) => [...acc, stamp.cancelled_at === null ? (acc.findLast((place) => place > 0) ?? 0) + 1 : 0],
    [],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-xl bg-neutral-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CycleStatusBadge cycle={cycle} />
          <span className="text-[13px] text-fg-muted">بدأت {formatDate(cycle.started_at)}</span>
        </div>
        <StampsProgress count={cycle.stamps_count} required={cycle.stamps_required} />
        {cycle.completed_at && (
          <span className="text-[13px] text-fg-muted">اكتملت {formatDateTime(cycle.completed_at)}</span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-[13px] text-fg-muted">الأختام بالترتيب، والملغاة معها</h3>
        {cycle.stamps.length === 0 ? (
          <p className="text-sm text-fg-muted">لا توجد أختام.</p>
        ) : (
          <ol>
            {cycle.stamps.map((stamp, index) => {
              const cancelled = stamp.cancelled_at !== null;
              return (
                <StampRow
                  key={stamp.id}
                  stamp={stamp}
                  number={cancelled ? null : places[index]}
                  onCancel={cancellable && !cancelled ? () => onCancelStamp(stamp) : undefined}
                />
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

function CancelStampDialog({ stamp, onClose }: { stamp: CycleStamp; onClose: () => void }) {
  const cancel = useCancelStamp();

  return (
    <ReasonOnlyDialog
      title="إلغاء هذا الطابع؟"
      description={`${methodLabels[stamp.method]} · ${formatDateTime(stamp.stamped_at)}`}
      confirmLabel="إلغاء الطابع"
      tone="danger"
      pending={cancel.isPending}
      onClose={onClose}
      onConfirm={(reason, setError) =>
        cancel.mutate(
          { id: stamp.id, reason },
          {
            onSuccess: () => {
              toast.success("تم إلغاء الطابع");
              onClose();
            },
            onError: (error) => handleActionError(error, { setError, onClose, conflicts: ["REWARD_ALREADY_REDEEMED"] }),
          },
        )
      }
    >
      <Notice>
        لا يُحذف، بل يبقى ظاهراً كطابع ملغى. إذا كان هو الطابع الذي أكمل البطاقة، تعود الدورة لجمع الأختام.
      </Notice>
    </ReasonOnlyDialog>
  );
}

type CycleDialogProps = {
  /** The cycle to show, or `null` when closed. */
  cycleId: number | null;
  /** Its title while it loads (from the customer page's row). */
  title: string;
  onClose: () => void;
};

/** A cycle's stamps in order, the cancelled ones too. With `cancel-stamps`, a wrong stamp is cancelled from here. */
export function CycleDialog({ cycleId, title, onClose }: CycleDialogProps) {
  const query = useCardCycle(cycleId);
  const canCancel = usePermission("cancel-stamps");
  const [stampToCancel, setStampToCancel] = useState<CycleStamp | null>(null);

  let body;
  if (query.isPending) {
    body = (
      <div aria-hidden className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  } else if (query.isError) {
    body = (
      <ErrorState description={getErrorMessage(query.error)} onRetry={() => void query.refetch()} retrying={query.isFetching} />
    );
  } else {
    body = <CycleBody cycle={query.data} onCancelStamp={canCancel ? setStampToCancel : undefined} />;
  }

  const cycle = query.data;
  return (
    <>
      <Dialog
        open={cycleId !== null}
        onOpenChange={(open) => !open && onClose()}
        size="lg"
        sheet
        title={cycle ? `${cycle.card.name} · ${cycle.merchant.business_name}` : title}
        footer={<DialogClose>إغلاق</DialogClose>}
      >
        {body}
      </Dialog>
      {stampToCancel && <CancelStampDialog stamp={stampToCancel} onClose={() => setStampToCancel(null)} />}
    </>
  );
}
