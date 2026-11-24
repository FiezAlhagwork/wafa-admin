import type { DeletionRequest } from "@/lib/api/types";

export type StatusFilter = DeletionRequest["status"] | "";
export type SubjectFilter = DeletionRequest["subject_type"] | "";
export type DeletionFilters = { status: StatusFilter; subject: SubjectFilter };

const statuses: StatusFilter[] = ["pending", "executed", "cancelled"];
const subjects: SubjectFilter[] = ["merchant", "customer"];

/** `?status=pending&type=merchant`; anything unknown falls back to "all". */
export function parseFilters(params: URLSearchParams): DeletionFilters {
  const status = params.get("status") ?? "";
  const subject = params.get("type") ?? "";
  return {
    status: statuses.includes(status as StatusFilter) ? (status as StatusFilter) : "",
    subject: subjects.includes(subject as SubjectFilter) ? (subject as SubjectFilter) : "",
  };
}

export function filtersToSearch({ status, subject }: DeletionFilters): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (subject) params.set("type", subject);
  const search = params.toString();
  return search ? `?${search}` : "";
}
