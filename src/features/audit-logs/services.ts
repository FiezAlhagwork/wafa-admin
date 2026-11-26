import { api } from "@/lib/api/client";
import type { AuditLogEntry } from "@/lib/api/types";
import type { AuditFilters } from "./filters";

const PAGE_SIZE = 20;

export type AuditLogPage = { entries: AuditLogEntry[]; nextCursor: string | null };

/** GET /admin/audit-logs: newest first, by cursor. `subject_id` is only sent with its `subject_type` (422 otherwise). */
export async function listAuditLogs({ filters, cursor }: { filters: AuditFilters; cursor?: string }): Promise<AuditLogPage> {
  const { data } = await api.get<{ data: AuditLogEntry[]; meta: { next_cursor: string | null } }>("/admin/audit-logs", {
    params: {
      action: filters.action || undefined,
      admin_user_id: filters.adminId ?? undefined,
      subject_type: filters.subjectType || undefined,
      subject_id: filters.subjectType ? (filters.subjectId ?? undefined) : undefined,
      cursor,
      limit: PAGE_SIZE,
    },
  });
  return { entries: data.data, nextCursor: data.meta.next_cursor };
}
