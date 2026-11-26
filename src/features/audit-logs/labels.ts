import type { BadgeTone, Status } from "@/components/ui";
import { statusLabel } from "@/components/ui";
import type { AuditLogEntry, AuditSubjectType } from "@/lib/api/types";
import { methodLabels } from "@/features/payments/labels";
import { roleLabels } from "@/lib/auth/roles";
import { formatDateTime, formatDay } from "@/lib/format";
import type { SubjectFilter } from "./filters";

/**
 * The actions the backend guide names. It gives no complete list (Notion A12): an action missing here is shown by its
 * code, never hidden, and the filter offers only these.
 */
export const actions: Record<string, { label: string; tone: BadgeTone }> = {
  "payment.approved": { label: "قبول دفعة", tone: "success" },
  "trial.extended": { label: "تمديد التجربة", tone: "info" },
  "merchant.suspended": { label: "إيقاف تاجر", tone: "danger" },
  "merchant.identity_updated": { label: "تعديل بيانات النشاط", tone: "neutral" },
  "merchant.deletion_scheduled": { label: "جدولة حذف تاجر", tone: "danger" },
  "merchant.deletion_cancelled": { label: "إلغاء حذف تاجر", tone: "neutral" },
  "merchant.deleted": { label: "حذف تاجر", tone: "danger" },
  "stamp.cancelled": { label: "إلغاء طابع", tone: "warning" },
  "customer.phone_revealed": { label: "كشف رقم زبون", tone: "warning" },
  "customer.birthdate_updated": { label: "تعديل تاريخ الميلاد", tone: "neutral" },
  "customer.deleted": { label: "حذف زبون", tone: "danger" },
  "settings.app_updated": { label: "تعديل إعدادات التطبيق", tone: "neutral" },
};

// An action the guide does not name is read from its code, "<record>.<verb>" or "<record>.<thing>_<verb>":
// "admin_user.created" → «إنشاء حساب إدارة», "settings.payment_method_updated" → «تعديل طريقة دفع». Only when every
// part is known; otherwise the code itself is shown (never hidden). Notion A12.
const records: Record<string, string> = {
  admin_user: "حساب إدارة",
  admin: "حساب إدارة",
  merchant: "تاجر",
  customer: "زبون",
  payment: "دفعة",
  stamp: "طابع",
  card: "بطاقة",
  package: "باقة",
  trial: "التجربة",
  settings: "الإعدادات",
  business_type: "نوع نشاط",
  icon: "أيقونة",
  payment_method: "طريقة دفع",
  payment_account: "طريقة دفع",
  deletion_request: "طلب حذف",
  link: "رابط",
  cover: "صورة الغلاف",
};

/** The thing inside a record that the action touched ("merchant.cover_removed"); it names the action instead. */
const things: Record<string, string> = {
  ...records,
  app: "إعدادات التطبيق",
  billing: "إعدادات الفوترة",
  identity: "بيانات النشاط",
  birthdate: "تاريخ الميلاد",
  phone: "الرقم",
  deletion: "الحذف",
  role: "الدور",
  price: "السعر",
  prices: "الأسعار",
  qr: "صورة QR",
};

const verbs: Record<string, { label: string; tone: BadgeTone }> = {
  created: { label: "إنشاء", tone: "success" },
  added: { label: "إضافة", tone: "success" },
  updated: { label: "تعديل", tone: "neutral" },
  changed: { label: "تغيير", tone: "neutral" },
  deleted: { label: "حذف", tone: "danger" },
  removed: { label: "إزالة", tone: "danger" },
  activated: { label: "تفعيل", tone: "success" },
  reactivated: { label: "إعادة تفعيل", tone: "success" },
  deactivated: { label: "تعطيل", tone: "danger" },
  suspended: { label: "إيقاف", tone: "danger" },
  paused: { label: "إيقاف مؤقت", tone: "warning" },
  resumed: { label: "استئناف", tone: "success" },
  approved: { label: "قبول", tone: "success" },
  rejected: { label: "رفض", tone: "danger" },
  cancelled: { label: "إلغاء", tone: "warning" },
  scheduled: { label: "جدولة", tone: "danger" },
  extended: { label: "تمديد", tone: "info" },
  linked: { label: "ربط", tone: "info" },
  unlinked: { label: "فك ربط", tone: "warning" },
  restored: { label: "استعادة", tone: "success" },
  revealed: { label: "كشف", tone: "warning" },
};

function readAction(action: string): { label: string; tone: BadgeTone } | null {
  const [record, rest, ...extra] = action.split(".");
  if (extra.length > 0 || !records[record] || !rest) return null;
  // The verb is the last word; what comes before it (if anything) is the thing touched
  const words = rest.split("_");
  const verb = verbs[words[words.length - 1]];
  const thing = words.slice(0, -1).join("_");
  if (!verb) return null;
  if (!thing) return { label: `${verb.label} ${records[record]}`, tone: verb.tone };
  if (!things[thing]) return null;
  return { label: `${verb.label} ${things[thing]}`, tone: verb.tone };
}

const actionInfo = (action: string) => actions[action] ?? readAction(action);

/** The Arabic name of an action, or its code when it can't be read. */
export const actionLabel = (action: string) => actionInfo(action)?.label ?? action;
export const actionTone = (action: string): BadgeTone => actionInfo(action)?.tone ?? "neutral";

export const actionOptions = [
  { value: "", label: "كل العمليات" },
  ...Object.entries(actions).map(([value, { label }]) => ({ value, label })),
];

export const subjectLabels: Record<AuditSubjectType, string> = {
  merchant: "تاجر",
  customer: "زبون",
  payment: "دفعة",
  stamp: "طابع",
  card: "بطاقة",
  package: "باقة",
  admin: "حساب إدارة",
};

export const subjectChips: { value: SubjectFilter; label: string }[] = [
  { value: "", label: "الكل" },
  { value: "merchant", label: "التجار" },
  { value: "customer", label: "الزبائن" },
  { value: "payment", label: "الدفعات" },
  { value: "stamp", label: "الطوابع" },
  { value: "card", label: "البطاقات" },
  { value: "package", label: "الباقات" },
  { value: "admin", label: "حسابات الإدارة" },
];

const isSubjectType = (value: string | null): value is AuditSubjectType => !!value && value in subjectLabels;

/** "تاجر #13" (the API gives no name: Notion A13), or null for an action on no record (settings). */
export function subjectName(entry: Pick<AuditLogEntry, "subject_type" | "subject_id">): string | null {
  if (!entry.subject_type) return null;
  const kind = isSubjectType(entry.subject_type) ? subjectLabels[entry.subject_type] : entry.subject_type;
  return entry.subject_id ? `${kind} #${entry.subject_id}` : kind;
}

/** The record's page in the dashboard, when it has one. */
export function subjectHref(entry: Pick<AuditLogEntry, "subject_type" | "subject_id">): string | null {
  if (!entry.subject_id) return null;
  if (entry.subject_type === "merchant") return `/admin/merchants/${entry.subject_id}`;
  if (entry.subject_type === "customer") return `/admin/customers/${entry.subject_id}`;
  return null;
}

/** The names of the keys `before`/`after` carry. An unknown key is shown by its code. */
const fieldLabels: Record<string, string> = {
  status: "الحالة",
  reason: "السبب",
  business_name: "اسم النشاط",
  business_type_id: "نوع النشاط",
  birthdate: "تاريخ الميلاد",
  trial_ends_at: "نهاية التجربة",
  ends_at: "تاريخ الانتهاء",
  days: "الأيام",
  rejection_reason: "سبب الرفض",
  amount_syp: "المبلغ بالليرة",
  price_usd: "السعر بالدولار",
  package_id: "الباقة",
  name: "الاسم",
  email: "البريد",
  role: "الدور",
  is_active: "مفعّل",
  linked: "مربوط بحساب الدخول",
  method: "طريقة الدفع",
  account: "الحساب",
  recipient_name: "اسم المستلم",
  qr_path: "صورة QR",
  qr_url: "صورة QR",
  sort_order: "الترتيب",
  cards_limit: "حد البطاقات",
  weekly_campaigns_limit: "حد الحملات الأسبوعي",
  pin_unlock_hours: "ساعات فتح الرمز",
  owner_name: "اسم المالك",
  cancel_reason: "سبب الإلغاء",
  cancelled_at: "تاريخ الإلغاء",
  deletion_request_id: "رقم طلب الحذف",
  subscription_period_id: "رقم فترة الاشتراك",
  payment_id: "رقم الدفعة",
  card_id: "رقم البطاقة",
  cycle_id: "رقم الدورة",
  phone: "الهاتف",
  source: "مصدر الطلب",
  note: "ملاحظة",
  executes_at: "موعد التنفيذ",
};

export const fieldLabel = (key: string) => fieldLabels[key] ?? key;

const ISO_MOMENT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** A value of `before`/`after` as text: statuses and dates in Arabic, yes/no, anything else as compact JSON. */
export function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  if (typeof value === "string") {
    if (key === "status" && value in statusLabels) return statusLabels[value];
    if (key === "method" && value in methodLabels) return methodLabels[value as keyof typeof methodLabels];
    // A stored file's path means nothing to a reader: only whether there is one
    if (key.endsWith("_path")) return "صورة مرفوعة";
    if (key === "role" && value in roleLabels) return roleLabels[value as keyof typeof roleLabels];
    if (ISO_MOMENT.test(value)) return formatDateTime(value);
    if (ISO_DAY.test(value)) return formatDay(value);
    return value;
  }
  // A record's number reads as one ("#7"), not as a quantity
  if (typeof value === "number") return key.endsWith("_id") ? `#${value}` : String(value);
  return JSON.stringify(value, null, 1);
}

// The status names the dashboard already shows (StatusBadge), read as text
const statusLabels: Record<string, string> = Object.fromEntries(
  (["TRIAL", "ACTIVE", "GRACE", "EXPIRED", "SUSPENDED", "PENDING_DELETION", "DELETED", "PENDING", "APPROVED", "REJECTED"] as Status[]).map(
    (status) => [status, statusLabel(status)],
  ),
);

export type Change = { key: string; before: unknown; after: unknown; changed: boolean };

/** Every key of either side, in the order they come: what it was, what it became. */
export function changesOf(entry: Pick<AuditLogEntry, "before" | "after">): Change[] {
  const before = entry.before ?? {};
  const after = entry.after ?? {};
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
  return keys.map((key) => ({
    key,
    before: before[key],
    after: after[key],
    changed: JSON.stringify(before[key]) !== JSON.stringify(after[key]),
  }));
}

/** One line for the list: the first change ("الحالة: فعّال ← موقوف"), or the first value when only one side exists. */
export function changeSummary(entry: Pick<AuditLogEntry, "before" | "after">): string | null {
  const change = changesOf(entry).find((item) => item.changed) ?? changesOf(entry)[0];
  if (!change) return null;
  const label = fieldLabel(change.key);
  if (entry.before && entry.after && change.before !== undefined && change.after !== undefined) {
    return `${label}: ${formatValue(change.key, change.before)} ← ${formatValue(change.key, change.after)}`;
  }
  return `${label}: ${formatValue(change.key, change.after ?? change.before)}`;
}
