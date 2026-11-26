// The audit log for the development preview (/dev/shell). Never imported outside /dev.
// Fixed entries covering every documented action, one the dashboard does not know (shown by its code) and one done by
// the system itself (`admin: null`).

import type { AuditLogEntry } from "@/lib/api/types";

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();
const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

const samer = { id: 1, name: "سامر الحلبي" };
const layla = { id: 2, name: "ليلى المراجعة" };
const hala = { id: 4, name: "هالة المدير" };
const karim = { id: 3, name: "كريم الدعم" };

type Seed = Omit<AuditLogEntry, "id" | "created_at" | "ip_address"> & { hours: number; ip?: string | null };

const seeds: Seed[] = [
  { hours: 0.3, action: "payment.approved", admin: layla, subject_type: "payment", subject_id: 6, before: { status: "PENDING" }, after: { status: "APPROVED" } },
  { hours: 1.2, action: "customer.phone_revealed", admin: karim, subject_type: "customer", subject_id: 731, before: null, after: null },
  { hours: 2, action: "merchant.suspended", admin: samer, subject_type: "merchant", subject_id: 109, before: { status: "ACTIVE" }, after: { status: "SUSPENDED", reason: "مخالفة شروط الاستخدام: عروض مضللة" } },
  { hours: 5, action: "trial.extended", admin: samer, subject_type: "merchant", subject_id: 101, before: { trial_ends_at: inDays(-5) }, after: { trial_ends_at: inDays(2), days: 7, reason: "تأخر تفعيل الحساب بسبب مشكلة في البريد" } },
  { hours: 8, action: "merchant.identity_updated", admin: karim, subject_type: "merchant", subject_id: 105, before: { business_name: "عيادة الشفا" }, after: { business_name: "عيادة الشفاء", reason: "تصحيح خطأ إملائي بطلب التاجر" } },
  { hours: 20, action: "stamp.cancelled", admin: hala, subject_type: "stamp", subject_id: 9001, before: { cancelled_at: null }, after: { cancelled_at: hoursAgo(20), cancel_reason: "طابع مكرر بالخطأ" } },
  { hours: 26, action: "customer.birthdate_updated", admin: karim, subject_type: "customer", subject_id: 702, before: { birthdate: "1995-03-02" }, after: { birthdate: "1996-03-02", reason: "خطأ عند التسجيل" } },
  { hours: 30, action: "package.updated", admin: samer, subject_type: "package", subject_id: 2, before: { cards_limit: 3, weekly_campaigns_limit: 1 }, after: { cards_limit: 5, weekly_campaigns_limit: 2 } },
  { hours: 49, action: "merchant.deletion_scheduled", admin: samer, subject_type: "merchant", subject_id: 110, before: { status: "ACTIVE" }, after: { status: "PENDING_DELETION", executes_at: inDays(5), source: "support", note: "رسالة من المالكة: أغلقت المحل" } },
  { hours: 55, action: "settings.payment_method_updated", admin: samer, subject_type: null, subject_id: null, before: { note: null, method: "sham_cash", account: "RAMZ-ALHESAB-123", qr_path: "payment-methods/JLyJPoElG4FZc9ZDuZvyTrO43UyWNkOeP04ZHn5D.png", is_active: true, sort_order: 1, recipient_name: null }, after: { note: null, method: "sham_cash", account: "RAMZ-ALHESAB-123", qr_path: null, is_active: true, sort_order: 1, recipient_name: null } },
  { hours: 60, action: "settings.app_updated", admin: samer, subject_type: null, subject_id: null, before: { pin_unlock_hours: 24, support_url: "https://wa.me/963900000000" }, after: { pin_unlock_hours: 48, support_url: "https://wa.me/963900000000" } },
  { hours: 66, action: "admin_user.created", admin: samer, subject_type: "admin", subject_id: 2, before: null, after: { name: "ليلى المراجعة", email: "layla.reviewer@example.com", role: "payments_reviewer" } },
  { hours: 72, action: "admin.unlinked", admin: null, subject_type: "admin", subject_id: 3, ip: null, before: { linked: true }, after: { linked: false } },
  { hours: 74, action: "merchant.weird_thing", admin: samer, subject_type: "merchant", subject_id: 106, before: null, after: null },
  { hours: 75, action: "payment.approved", admin: layla, subject_type: "payment", subject_id: 7, before: { status: "PENDING" }, after: { status: "APPROVED" } },
  { hours: 90, action: "customer.deleted", admin: samer, subject_type: "customer", subject_id: 501, before: { name: "رامي", phone: "0933***456" }, after: null },
  { hours: 110, action: "merchant.identity_updated", admin: samer, subject_type: "merchant", subject_id: 105, before: { business_type_id: 4 }, after: { business_type_id: 6, reason: "النوع الصحيح عيادة" } },
  { hours: 130, action: "trial.extended", admin: samer, subject_type: "merchant", subject_id: 105, before: { trial_ends_at: inDays(-40) }, after: { trial_ends_at: inDays(-33), days: 7, reason: "تعويض عن عطل" } },
  { hours: 160, action: "merchant.deletion_cancelled", admin: samer, subject_type: "merchant", subject_id: 107, before: { status: "PENDING_DELETION" }, after: { status: "GRACE" } },
  { hours: 200, action: "stamp.cancelled", admin: hala, subject_type: "stamp", subject_id: 8840, before: { cancelled_at: null }, after: { cancelled_at: hoursAgo(200), cancel_reason: "الزبون لم يشترِ" } },
  { hours: 260, action: "customer.phone_revealed", admin: hala, subject_type: "customer", subject_id: 715, before: null, after: null },
  { hours: 300, action: "merchant.deleted", admin: null, subject_type: "merchant", subject_id: 111, ip: null, before: { owner_name: "سعيد", email: "old@example.com" }, after: { owner_name: null, email: null } },
  { hours: 400, action: "merchant.suspended", admin: samer, subject_type: "merchant", subject_id: 105, before: { status: "ACTIVE" }, after: { status: "SUSPENDED", reason: "تأكيد هوية المالك" } },
];

const entries: AuditLogEntry[] = seeds.map(({ hours, ip, ...seed }, index) => ({
  ...seed,
  id: 300 - index,
  ip_address: ip === undefined ? `10.0.0.${(index % 9) + 2}` : ip,
  created_at: hoursAgo(hours),
}));

/** Newest first, with the server's four filters. */
export function listAudit(params: Record<string, string | undefined>): AuditLogEntry[] {
  return entries
    .filter((entry) => (params.action ? entry.action === params.action : true))
    .filter((entry) => (params.admin_user_id ? entry.admin?.id === Number(params.admin_user_id) : true))
    .filter((entry) => (params.subject_type ? entry.subject_type === params.subject_type : true))
    .filter((entry) => (params.subject_id ? entry.subject_id === Number(params.subject_id) : true));
}
