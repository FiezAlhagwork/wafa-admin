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
import type { AdminMerchant } from "@/lib/api/types";
import { MerchantContact, MerchantIdentity, MerchantPackage, MerchantStatus, RegisteredAt } from "./MerchantParts";

// The table is for large screens only (below `lg` the screen shows cards).
const COLUMNS = 6;
const cell = "px-3";

function Head() {
  return (
    <TableHead>
      <tr>
        <TableHeaderCell className={cell}>النشاط</TableHeaderCell>
        <TableHeaderCell className={cell}>التواصل</TableHeaderCell>
        <TableHeaderCell className={cell}>الباقة</TableHeaderCell>
        <TableHeaderCell className={cell}>الحالة</TableHeaderCell>
        <TableHeaderCell className={cell}>التسجيل</TableHeaderCell>
        <TableHeaderCell className={cell}>
          <span className="sr-only">فتح</span>
        </TableHeaderCell>
      </tr>
    </TableHead>
  );
}

export function MerchantsTableSkeleton() {
  return (
    <Table>
      <Head />
      <TableBody>
        <TableSkeletonRows rows={6} columns={COLUMNS} />
      </TableBody>
    </Table>
  );
}

type MerchantsTableProps = {
  merchants: AdminMerchant[];
  onOpen: (merchant: AdminMerchant) => void;
};

export function MerchantsTable({ merchants, onOpen }: MerchantsTableProps) {
  return (
    <Table>
      <Head />
      <TableBody>
        {merchants.map((merchant) => (
          <TableRow
            key={merchant.id}
            className="relative cursor-pointer has-focus-visible:bg-neutral-50 has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-focus"
          >
            <TableCell className={cell}>
              <MerchantIdentity merchant={merchant} onOpen={() => onOpen(merchant)} className="max-w-60" />
            </TableCell>
            <TableCell className={cell}>
              <MerchantContact merchant={merchant} className="max-w-52" />
            </TableCell>
            <TableCell className={cell}>
              <MerchantPackage merchant={merchant} />
            </TableCell>
            <TableCell className={cell}>
              <MerchantStatus merchant={merchant} />
            </TableCell>
            <TableCell className={cell}>
              <RegisteredAt merchant={merchant} />
            </TableCell>
            <TableCell className={`${cell} w-10 text-end text-fg-subtle`}>
              <CaretLeft aria-hidden className="size-4.5" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
