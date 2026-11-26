import type { AuditSubjectType } from "@/lib/api/types";

export type SubjectFilter = AuditSubjectType | "";

export type AuditFilters = {
  /** Any code (a link may carry one the list of known actions lacks); "" = all. */
  action: string;
  adminId: number | null;
  subjectType: SubjectFilter;
  /** Only with a subject type (the server answers 422 otherwise). */
  subjectId: number | null;
};

export const subjectTypes: AuditSubjectType[] = ["merchant", "customer", "payment", "stamp", "card", "package", "admin"];

const positive = (value: string | null) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};

/** `?action=merchant.suspended&admin=1&subject_type=merchant&subject_id=13`; anything unknown falls back to "all". */
export function parseFilters(params: URLSearchParams): AuditFilters {
  const action = params.get("action") ?? "";
  const type = params.get("subject_type") ?? "";
  const subjectType = subjectTypes.includes(type as AuditSubjectType) ? (type as AuditSubjectType) : "";
  return {
    action: /^[a-z_]+\.[a-z_]+$/.test(action) && action.length <= 64 ? action : "",
    adminId: positive(params.get("admin")),
    subjectType,
    subjectId: subjectType ? positive(params.get("subject_id")) : null,
  };
}

export function filtersToSearch({ action, adminId, subjectType, subjectId }: AuditFilters): string {
  const params = new URLSearchParams();
  if (action) params.set("action", action);
  if (adminId) params.set("admin", String(adminId));
  if (subjectType) params.set("subject_type", subjectType);
  if (subjectType && subjectId) params.set("subject_id", String(subjectId));
  const search = params.toString();
  return search ? `?${search}` : "";
}

export const hasFilters = (filters: AuditFilters) =>
  !!filters.action || filters.adminId !== null || !!filters.subjectType || filters.subjectId !== null;

export const noFilters: AuditFilters = { action: "", adminId: null, subjectType: "", subjectId: null };
