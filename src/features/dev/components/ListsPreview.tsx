"use client";

import { useState } from "react";
import { Plus, Storefront } from "@phosphor-icons/react";
import {
  Avatar,
  Button,
  IconTile,
  StatCard,
  Drawer,
  Field,
  LoadMore,
  Select,
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

const filterOptions = [
  { value: "", label: "كل الحالات" },
  { value: "TRIAL", label: "تجربة" },
  { value: "ACTIVE", label: "فعّال" },
  { value: "GRACE", label: "فترة سماح" },
  { value: "SUSPENDED", label: "موقوف" },
];

const rows: { name: string; owner: string; status: Status; since: string }[] = [
  { name: "مقهى الياسمين", owner: "سامر الحلبي", status: "ACTIVE", since: "12 أيلول 2026" },
  { name: "مخبز الشام", owner: "ريم الخطيب", status: "TRIAL", since: "28 أيلول 2026" },
  { name: "صالون لمسة", owner: "هدى منصور", status: "SUSPENDED", since: "3 آب 2026" },
];

export function ListsPreview() {
  const [moreLoading, setMoreLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState("");

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

      <PreviewSection title="Avatar · IconTile · StatCard">
        <PreviewRow label="Avatar: أحجام وألوان حسب seed، والشعار إن وجد">
          {["مطعم الفرات", "صالون لمسة", "فرن الضيعة", "مكتبة النور", "نادي القوة"].map((name, index) => (
            <Avatar key={name} name={name} seed={index} />
          ))}
          <Avatar name="مقهى الورد" seed={2} size="sm" />
          <Avatar name="مقهى الورد" seed={3} size="lg" />
          <Avatar name="مقهى الورد" seed={0} size="xl" />
        </PreviewRow>
        <PreviewRow label="IconTile: الألوان">
          {(["brand", "teal", "amber", "info", "warning", "danger", "neutral"] as const).map((tone) => (
            <IconTile key={tone} icon={<Storefront />} tone={tone} />
          ))}
        </PreviewRow>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard tone="accent" label="دخل نوفمبر 2026" value="18,420,000 ل.س" hint="$1,412.00 · 31 دفعة مقبولة" />
          <StatCard label="التجار الفعّالون" value="61" icon={<Storefront />} iconTone="teal" hint="من 128 تاجر مسجّل" />
          <StatCard tone="warning" label="دفعات بانتظار المراجعة" value="6" icon={<Storefront />} iconTone="warning" hint="2 متأخرة" />
          <StatCard label="تحميل" value="0" icon={<Storefront />} loading />
        </div>
      </PreviewSection>

      <PreviewSection title="Select">
        <PreviewRow label="افتراضي · بدون مطابقة · معطّل · خطأ">
          <div className="w-52">
            <Select label="الحالة" value={filter} onValueChange={setFilter} options={filterOptions} />
          </div>
          <div className="w-52">
            <Select label="بدون خيار مطابق" value="none" onValueChange={setFilter} options={filterOptions} placeholder="اختر الحالة" />
          </div>
          <div className="w-52">
            <Select label="معطّل" value="" onValueChange={setFilter} options={filterOptions} disabled />
          </div>
          <div className="w-52">
            <Field label="الحالة" error="اختر حالة صحيحة" required>
              <Select value="none" onValueChange={setFilter} options={filterOptions} placeholder="اختر الحالة" />
            </Field>
          </div>
        </PreviewRow>
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
