"use client";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableSkeletonRows,
} from "@/components/ui";
import type { AdminPayment, PaymentStatus } from "@/lib/api/types";
import { formatDuration } from "../labels";
import { PaymentAmount, PaymentBadges, PaymentMerchant, PaymentMethod, PaymentSentAt } from "./PaymentParts";

// The table is for large screens only (below `lg` the screen shows cards): six compact columns that fit beside an
// open sidebar without scrolling sideways. Cells may wrap; the email truncates.
const COLUMNS = 6;
const cell = "px-3";

function Head({ status }: { status: PaymentStatus }) {
  return (
    <TableHead>
      <tr>
        <TableHeaderCell className={cell}>التاجر</TableHeaderCell>
        <TableHeaderCell className={cell}>الباقة</TableHeaderCell>
        <TableHeaderCell className={cell}>المبلغ</TableHeaderCell>
        <TableHeaderCell className={cell}>الطريقة · الإرسال</TableHeaderCell>
        <TableHeaderCell className={cell}>{status === "PENDING" ? "تنبيهات" : "الحالة"}</TableHeaderCell>
        <TableHeaderCell className={cell}>
          <span className="sr-only">إجراءات</span>
        </TableHeaderCell>
      </tr>
    </TableHead>
  );
}

export function PaymentsTableSkeleton({ status }: { status: PaymentStatus }) {
  return (
    <Table>
      <Head status={status} />
      <TableBody>
        <TableSkeletonRows rows={6} columns={COLUMNS} />
      </TableBody>
    </Table>
  );
}

type PaymentsTableProps = {
  payments: AdminPayment[];
  /** The tab: it decides the alerts/status column. */
  status: PaymentStatus;
  onOpen: (payment: AdminPayment) => void;
};

export function PaymentsTable({ payments, status, onOpen }: PaymentsTableProps) {
  const queue = status === "PENDING";

  return (
    <Table>
      <Head status={status} />
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
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

            <TableCell className={`${cell} text-end`}>
              <Button size="sm" variant="secondary" onClick={() => onOpen(payment)}>
                {queue ? "مراجعة" : "عرض"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
