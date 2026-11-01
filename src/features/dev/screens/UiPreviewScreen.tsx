"use client";

import { useState } from "react";
import {
  CheckCircle,
  CreditCard,
  DotsThreeVertical,
  Eye,
  FunnelSimple,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Seal,
  Star,
  Storefront,
  Timer,
  Trash,
} from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Input,
  OtpField,
  Skeleton,
  Spinner,
  StatCard,
  StatusBadge,
  Textarea,
  toast,
  type ButtonVariant,
  type Status,
} from "@/components/ui";
import { OverlaysPreview } from "../components/OverlaysPreview";
import { PreviewRow as Row, PreviewSection as Section } from "../components/PreviewLayout";

const variants: ButtonVariant[] = ["primary", "accent", "secondary", "ghost", "danger"];

const statusGroups: { title: string; statuses: (Status | null)[] }[] = [
  { title: "التاجر", statuses: ["TRIAL", "ACTIVE", "GRACE", "EXPIRED", "SUSPENDED", "PENDING_DELETION", "DELETED", null] },
  { title: "الدفعة", statuses: ["PENDING", "APPROVED", "REJECTED"] },
  { title: "طلب الحذف", statuses: ["pending", "executed", "cancelled"] },
  { title: "التنبيهات", statuses: ["overdue", "duplicate_reference"] },
];

export function UiPreviewScreen() {
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [otp, setOtp] = useState("");

  const simulate = (set: (value: boolean) => void) => {
    set(true);
    setTimeout(() => set(false), 1500);
  };

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">معاينة المكوّنات</h1>
        <p className="text-fg-muted">للتطوير فقط، غير متاحة في الإنتاج. جرّب Tab للتأكد من حلقة التركيز.</p>
      </header>

      <Section title="Button">
        {(["sm", "md", "lg"] as const).map((size) => (
          <Row key={size} label={size}>
            {variants.map((variant) => (
              <Button key={variant} variant={variant} size={size}>
                {variant}
              </Button>
            ))}
          </Row>
        ))}
        <Row label="أيقونة">
          <Button variant="accent" icon={<Plus className="size-4" />}>
            إضافة باقة
          </Button>
          <Button icon={<CheckCircle className="size-4" />}>قبول الدفعة</Button>
          <Button variant="secondary" icon={<FunnelSimple className="size-4" />}>
            الفلاتر
          </Button>
          <Button variant="danger" icon={<Trash className="size-4" />}>
            حذف التاجر
          </Button>
        </Row>
        <Row label="loading">
          {variants.map((variant) => (
            <Button key={variant} variant={variant} loading>
              حفظ التغييرات
            </Button>
          ))}
          <Button variant="secondary" onClick={() => simulate(setLoading)} loading={loading}>
            اضغط للتجربة
          </Button>
        </Row>
        <Row label="disabled">
          {variants.map((variant) => (
            <Button key={variant} variant={variant} disabled>
              غير متاح
            </Button>
          ))}
        </Row>
        <Row label="fullWidth">
          <div className="w-72">
            <Button fullWidth>قبول الدفعة</Button>
          </div>
        </Row>
      </Section>

      <Section title="IconButton">
        {(["sm", "md", "lg"] as const).map((size) => (
          <Row key={size} label={size}>
            {variants.map((variant) => (
              <IconButton key={variant} variant={variant} size={size} label="تعديل" icon={<PencilSimple className="size-5" />} />
            ))}
            <IconButton size={size} label="تحميل" icon={<Eye className="size-5" />} loading />
            <IconButton size={size} label="غير متاح" icon={<DotsThreeVertical className="size-5" />} disabled />
          </Row>
        ))}
      </Section>

      <Section title="Spinner">
        <Row label="الأحجام">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" label="جارٍ التحميل" className="text-brand" />
        </Row>
      </Section>

      <Section title="Field · Input · Textarea">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="اسم النشاط" required hint="كما يظهر للزبائن على البطاقة.">
            <Input placeholder="مثلاً: مقهى الياسمين" />
          </Field>
          <Field label="اسم النشاط" required error="هذا الحقل مطلوب">
            <Input defaultValue="" />
          </Field>
          <Field label="بحث" hint="رقم الهاتف كامل.">
            <Input type="tel" dir="ltr" placeholder="+963 9xx xxx xxx" startIcon={<MagnifyingGlass />} />
          </Field>
          <Field label="البريد الإلكتروني" disabled hint="لا يمكن تعديله.">
            <Input defaultValue="merchant@example.com" dir="ltr" className="text-end" />
          </Field>
          <Field label="السبب" required hint="يُسجَّل في سجل العمليات." className="md:col-span-2">
            <Textarea placeholder="اكتب سبب الإجراء…" />
          </Field>
          <Field label="السبب" required error="يجب ألا يقل عن 10 أحرف" className="md:col-span-2">
            <Textarea defaultValue="قصير" />
          </Field>
          <Field label="رمز التحقق" hint="أكمل الخانات الست لتجربة onComplete.">
            <OtpField value={otp} onValueChange={setOtp} onComplete={(value) => toast.success(`الرمز: ${value}`)} />
          </Field>
          <Field label="رمز التحقق" error="الرمز غير صحيح">
            <OtpField value="123" onValueChange={() => {}} />
          </Field>
        </div>
      </Section>

      <Section title="Badge">
        <Row label="tone">
          {(["neutral", "brand", "amber", "success", "warning", "danger", "info"] as const).map((tone) => (
            <Badge key={tone} tone={tone}>
              {tone}
            </Badge>
          ))}
        </Row>
        <Row label="dot / icon">
          <Badge tone="success" dot>
            مع نقطة
          </Badge>
          <Badge tone="info" icon={<CheckCircle weight="fill" />}>
            مع أيقونة
          </Badge>
          <Badge tone="amber" icon={<Star weight="fill" />}>
            الأكثر طلباً
          </Badge>
          <Badge tone="amber" dot>
            8 طوابع
          </Badge>
        </Row>
      </Section>

      <Section title="StatusBadge">
        {statusGroups.map((group) => (
          <Row key={group.title} label={group.title}>
            {group.statuses.map((status) => (
              <StatusBadge key={status ?? "null"} status={status} />
            ))}
          </Row>
        ))}
      </Section>

      <Section title="Card · StatCard">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="طوابع اليوم" value="2,317" icon={<Seal />} tone="accent" hint="+8% عن أمس" />
          <StatCard label="التجار الفعّالون" value="1,248" icon={<Storefront />} hint="+12 هذا الأسبوع" />
          <StatCard label="دفعات بانتظار المراجعة" value="7" icon={<CreditCard />} tone="warning" hint="3 منها متأخرة" />
          <StatCard label="تجارب تنتهي هذا الأسبوع" value="—" icon={<Timer />} loading />
        </div>
        <Card>
          <CardHeader
            title="آخر الدفعات"
            description="الدفعات المرسلة خلال آخر 24 ساعة."
            actions={<Button variant="secondary" size="sm">عرض الكل</Button>}
          />
          <CardBody className="flex flex-col gap-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </CardBody>
        </Card>
        <Card highlight>
          <CardHeader
            title="الباقة الذهبية"
            description="الباقة الافتراضية للتجار الجدد."
            actions={
              <Badge tone="amber" icon={<Star weight="fill" />}>
                الأكثر طلباً
              </Badge>
            }
          />
          <CardBody className="text-sm text-fg-muted">كرت مميّز بشريط كهرماني على جهة البداية.</CardBody>
        </Card>
      </Section>

      <Section title="EmptyState · ErrorState">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <EmptyState
              icon={<MagnifyingGlass />}
              title="لا توجد نتائج"
              description="لا يوجد تجار يطابقون هذه الفلاتر."
              action={<Button variant="secondary" size="sm">مسح الفلاتر</Button>}
            />
          </Card>
          <Card>
            <ErrorState
              description="تحقّق من اتصالك بالإنترنت ثم حاول مرة أخرى."
              onRetry={() => simulate(setRetrying)}
              retrying={retrying}
            />
          </Card>
        </div>
      </Section>

      <header className="flex flex-col gap-1 border-t-4 border-amber pt-6">
        <h2 className="text-xl font-bold">الدفعة 2 — النوافذ والقوائم والإشعارات</h2>
        <p className="text-fg-muted">جرّب Esc والأسهم داخل القائمة، والتركيز يرجع للزر بعد الإغلاق.</p>
      </header>
      <OverlaysPreview />
    </main>
  );
}
