"use client";

import { useState } from "react";
import {
  CaretDown,
  CheckCircle,
  ClockCounterClockwise,
  DotsThreeVertical,
  Eye,
  PauseCircle,
  PencilSimple,
  Prohibit,
  SignOut,
  Trash,
  UserCircle,
} from "@phosphor-icons/react";
import {
  Button,
  ConfirmDialog,
  Dialog,
  DialogClose,
  Field,
  IconButton,
  Menu,
  MenuGroup,
  MenuItem,
  MenuSeparator,
  Textarea,
  toast,
  Tooltip,
} from "@/components/ui";
import { PreviewRow, PreviewSection } from "./PreviewLayout";

export function OverlaysPreview() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setFormOpen(false);
      toast.success("تم تعليق التاجر", { description: "سُجّل الإجراء في سجل العمليات." });
    }, 1500);
  };

  const remove = () => {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setDeleteOpen(false);
      toast.success("تم حذف التاجر");
    }, 1500);
  };

  return (
    <>
      <PreviewSection title="Dialog">
        <PreviewRow label="عادي">
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            فتح نافذة
          </Button>
          <Button variant="secondary" onClick={() => setFormOpen(true)}>
            نافذة مع نموذج (dismissible أثناء الحفظ = false)
          </Button>
        </PreviewRow>

        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="تفاصيل الدفعة"
          description="أُرسلت قبل ساعتين عبر سيريتل كاش."
          footer={<DialogClose>إغلاق</DialogClose>}
        >
          <p className="text-sm leading-relaxed text-fg-muted">
            محتوى النافذة هنا. اضغط Esc أو خارج النافذة أو زر X للإغلاق، والتركيز يرجع للزر اللي فتحها.
          </p>
        </Dialog>

        <Dialog
          open={formOpen}
          onOpenChange={setFormOpen}
          dismissible={!saving}
          title="تعليق التاجر"
          description="لن يتمكن التاجر من إضافة طوابع حتى يُعاد تفعيله."
          footer={
            <>
              <DialogClose disabled={saving}>إلغاء</DialogClose>
              <Button variant="danger" loading={saving} onClick={save}>
                تعليق
              </Button>
            </>
          }
        >
          <Field label="السبب" required hint="يُسجَّل في سجل العمليات.">
            <Textarea placeholder="اكتب سبب التعليق…" />
          </Field>
        </Dialog>
      </PreviewSection>

      <PreviewSection title="ConfirmDialog">
        <PreviewRow label="tone">
          <Button variant="danger" icon={<Trash className="size-4" />} onClick={() => setDeleteOpen(true)}>
            حذف التاجر
          </Button>
          <Button icon={<CheckCircle className="size-4" />} onClick={() => setApproveOpen(true)}>
            قبول الدفعة
          </Button>
        </PreviewRow>

        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          tone="danger"
          title="حذف مقهى الياسمين؟"
          description="لا يمكن التراجع عن هذا الإجراء."
          confirmLabel="حذف نهائياً"
          loading={deleting}
          onConfirm={remove}
        >
          <p className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">
            لدى هذا التاجر 12 هدية جاهزة لم يستلمها الزبائن بعد.
          </p>
        </ConfirmDialog>

        <ConfirmDialog
          open={approveOpen}
          onOpenChange={setApproveOpen}
          title="قبول الدفعة؟"
          description="سيُفعَّل اشتراك التاجر فوراً لمدة 3 أشهر."
          confirmLabel="قبول"
          onConfirm={() => {
            setApproveOpen(false);
            toast.success("تم قبول الدفعة");
          }}
        />
      </PreviewSection>

      <PreviewSection title="Toast">
        <PreviewRow label="type">
          <Button variant="secondary" onClick={() => toast.success("تم حفظ التغييرات")}>
            success
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.error("دورك لا يسمح بهذه العملية", { id: "forbidden" })}
          >
            error (403)
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.warning("طلبات كثيرة", { description: "حاول مرة أخرى بعد 30 ثانية." })}
          >
            warning (429)
          </Button>
          <Button variant="secondary" onClick={() => toast.info("تم تحديث البيانات", { description: "عدّل شخص آخر هذا العنصر." })}>
            info
          </Button>
        </PreviewRow>
        <PreviewRow label="تكديس">
          <Button
            variant="secondary"
            onClick={() => {
              toast.success("تم قبول الدفعة #1042");
              setTimeout(() => toast.success("تم قبول الدفعة #1043"), 300);
              setTimeout(() => toast.success("تم قبول الدفعة #1044"), 600);
            }}
          >
            3 ورا بعض
          </Button>
          <Button variant="ghost" onClick={() => toast.close()}>
            إغلاق الكل
          </Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Menu">
        <PreviewRow label="trigger">
          <Menu trigger={<IconButton label="خيارات التاجر" icon={<DotsThreeVertical className="size-5" />} />}>
            <MenuItem icon={<Eye />}>عرض التفاصيل</MenuItem>
            <MenuItem icon={<PencilSimple />} onClick={() => toast.info("تعديل")}>
              تعديل الهوية
            </MenuItem>
            <MenuItem icon={<ClockCounterClockwise />} disabled>
              تمديد التجربة (غير متاح)
            </MenuItem>
            <MenuSeparator />
            <MenuItem tone="danger" icon={<PauseCircle />}>
              تعليق التاجر
            </MenuItem>
            <MenuItem tone="danger" icon={<Prohibit />}>
              حذف التاجر
            </MenuItem>
          </Menu>

          <Menu
            align="start"
            trigger={
              <Button variant="secondary" icon={<UserCircle className="size-5" />}>
                سارة أحمد
                <CaretDown className="size-4 text-fg-muted" />
              </Button>
            }
          >
            <MenuGroup label="sara@wafa.app">
              <MenuItem icon={<UserCircle />}>حسابي</MenuItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuItem icon={<SignOut className="rtl:-scale-x-100" />}>تسجيل الخروج</MenuItem>
          </Menu>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Tooltip">
        <PreviewRow label="side">
          {(["top", "bottom", "inline-start", "inline-end"] as const).map((side) => (
            <Tooltip key={side} content={`تعديل (${side})`} side={side}>
              <IconButton variant="secondary" label="تعديل" icon={<PencilSimple className="size-5" />} />
            </Tooltip>
          ))}
          <Tooltip content="يظهر مع Tab كمان">
            <Button variant="secondary">على زر عادي</Button>
          </Tooltip>
        </PreviewRow>
      </PreviewSection>
    </>
  );
}
