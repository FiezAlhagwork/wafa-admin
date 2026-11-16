"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import {
  Button,
  Drawer,
  LoadMore,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableSkeletonRows,
  type Status,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { PreviewRow, PreviewSection } from "./PreviewLayout";

const rows: { name: string; owner: string; status: Status; since: string }[] = [
  { name: "مقهى الياسمين", owner: "سامر الحلبي", status: "ACTIVE", since: "12 أيلول 2026" },
  { name: "مخبز الشام", owner: "ريم الخطيب", status: "TRIAL", since: "28 أيلول 2026" },
  { name: "صالون لمسة", owner: "هدى منصور", status: "SUSPENDED", since: "3 آب 2026" },
];

export function ListsPreview() {
  const [moreLoading, setMoreLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadMore = () => {
    setMoreLoading(true);
    setTimeout(() => setMoreLoading(false), 1500);
  };

  return (
    <>
      <PreviewSection title="PageHeader">
        <PageHeader
          title="التجار"
          description="كل المتاجر المسجّلة على المنصة."
          actions={
            <Button variant="accent" icon={<Plus className="size-4" />}>
              إجراء رئيسي
            </Button>
          }
        />
      </PreviewSection>

      <PreviewSection title="Table · LoadMore">
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>النشاط</TableHeaderCell>
              <TableHeaderCell>المالك</TableHeaderCell>
              <TableHeaderCell>الحالة</TableHeaderCell>
              <TableHeaderCell>منذ</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.owner}</TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-fg-muted">{row.since}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PreviewRow label="loading">
          <div className="w-full">
            <Table>
              <TableBody>
                <TableSkeletonRows rows={3} columns={4} />
              </TableBody>
            </Table>
          </div>
        </PreviewRow>
        <PreviewRow label="LoadMore">
          <LoadMore hasNextPage loading={moreLoading} onLoadMore={loadMore} className="pt-0" />
          <LoadMore hasNextPage loading onLoadMore={loadMore} className="pt-0" />
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Drawer">
        <PreviewRow label="القائمة">
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            فتح الدرج
          </Button>
        </PreviewRow>
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} label="قائمة تجريبية">
          <div className="flex flex-col gap-4 p-5">
            <p className="font-bold text-fg">درج جانبي</p>
            <p className="text-sm text-fg-muted">يُفتح من جهة البداية (يمين في العربية). جرّب Esc والنقر على الخلفية.</p>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              إغلاق
            </Button>
          </div>
        </Drawer>
      </PreviewSection>
    </>
  );
}
