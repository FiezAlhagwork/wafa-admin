import type { DeletionRequest } from "@/lib/api/types";
import type { StatusFilter, SubjectFilter } from "./filters";

export const sourceLabels: Record<DeletionRequest["source"], string> = {
  app: "من التطبيق",
  web: "صفحة الحذف على الموقع",
  email: "البريد",
  support: "الدعم",
};

export const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: "", label: "الكل" },
  { value: "pending", label: "بانتظار التنفيذ" },
  { value: "executed", label: "منفّذة" },
  { value: "cancelled", label: "ملغاة" },
];

export const subjectChips: { value: SubjectFilter; label: string }[] = [
  { value: "", label: "الكل" },
  { value: "merchant", label: "تجار" },
  { value: "customer", label: "زبائن" },
];

export const emptyStates: Record<StatusFilter, { title: string; description: string }> = {
  "": { title: "لا توجد طلبات حذف", description: "تظهر هنا طلبات حذف حسابات التجار والزبائن." },
  pending: { title: "لا توجد طلبات بانتظار التنفيذ", description: "لا يوجد تاجر في مهلة الحذف الآن." },
  executed: { title: "لا توجد طلبات منفّذة", description: "تظهر هنا الحسابات التي حُذفت." },
  cancelled: { title: "لا توجد طلبات ملغاة", description: "تظهر هنا طلبات الحذف التي أُلغيت خلال المهلة." },
};

/** "كافيه الياسمين", or "زبون #42" (the API gives no name for a customer). */
export const subjectName = (request: DeletionRequest) =>
  request.subject_name ?? (request.subject_type === "customer" ? `زبون #${request.subject_id}` : `تاجر #${request.subject_id}`);

/**
 * Whether the row can open the account. A deleted customer has no page any more; a merchant always has one (after the
 * deletion only the personal data is wiped, the shop stays).
 */
export const canOpenSubject = (request: DeletionRequest) =>
  request.subject_type === "merchant" || request.status !== "executed";
