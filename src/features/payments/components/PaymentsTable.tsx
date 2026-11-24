"use client";

import { CaretLeft } from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableSkeletonRows,
} from "@/components/ui";
import type { AdminPayment } from "@/lib/api/types";
import { formatDuration } from "../labels";
import { PaymentAmount, PaymentBadges, PaymentMerchant, PaymentMethod, PaymentSentAt } from "./PaymentParts";

// The table is for large screens only (below `lg` the screen shows cards): six compact columns that fit beside an
// open sidebar without scrolling sideways. Cells may wrap; the email truncates.
const COLUMNS = 6;
const cell = "px-3";

function Head({ queue }: { queue: boolean }) {
  return (
    <TableHead>
      <tr>
        <TableHeaderCell className={cell}>التاجر</TableHeaderCell>
        <TableHeaderCell className={cell}>الباقة</TableHeaderCell>
        <TableHeaderCell className={cell}>المبلغ</TableHeaderCell>
        <TableHeaderCell className={cell}>الطريقة · الإرسال</TableHeaderCell>
        <TableHeaderCell className={cell}>{queue ? "تنبيهات" : "الحالة"}</TableHeaderCell>
        <TableHeaderCell className={cell}>
          <span className="sr-only">فتح</span>
        </TableHeaderCell>
      </tr>
    </TableHead>
  );
}

export function PaymentsTableSkeleton({ queue }: { queue: boolean }) {
  return (
    <Table>
      <Head queue={queue} />
      <TableBody>
        <TableSkeletonRows rows={6} columns={COLUMNS} />
      </TableBody>
    </Table>
  );
}

type PaymentsTableProps = {
  payments: AdminPayment[];
  /** The review queue shows the alerts; anywhere else, the outcome. */
  queue: boolean;
  onOpen: (payment: AdminPayment) => void;
};

export function PaymentsTable({ payments, queue, onOpen }: PaymentsTableProps) {
  return (
    <Table>
      <Head queue={queue} />
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id} className="relative cursor-pointer has-focus-visible:bg-neutral-50 has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-focus">
            <TableCell className={cell}>
              <PaymentMerchant payment={payment} className="max-w-60" />
            </TableCell>

            <TableCell className={cell}>
              <div className="flex flex-col">
                <span>{payment.package.name}</span>
                <span className="text-xs text-fg-muted">{formatDuration(payment.duration_months)}</span>
              </div>
            </TableCell>

            <TableCell className={cell}>
              <PaymentAmount payment={payment} />
            </TableCell>

            <TableCell className={cell}>
              {/* Two blocks, both aligned to the start: how it was paid, then when it was sent */}
              <div className="flex min-w-0 flex-col gap-2">
                <PaymentMethod payment={payment} />
                <PaymentSentAt payment={payment} className="border-t border-divider pt-2" />
              </div>
            </TableCell>

            <TableCell className={cell}>
              <PaymentBadges payment={payment} queue={queue} empty={<span className="text-fg-muted">—</span>} />
            </TableCell>

            <TableCell className={`${cell} w-10 text-end`}>
              {/* Stretched over the row (the row is `relative`): one real button per row, the whole row opens it */}
              <button
                type="button"
                aria-label={`${queue ? "مراجعة" : "عرض"} الدفعة #${payment.id}`}
                onClick={() => onOpen(payment)}
                className="inline-flex cursor-pointer text-fg-subtle outline-none after:absolute after:inset-0 after:content-['']"
              >
                <CaretLeft aria-hidden className="size-4.5" />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
