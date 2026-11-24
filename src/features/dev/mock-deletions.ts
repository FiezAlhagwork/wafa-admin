// Deletion requests for the development preview (/dev/shell). Never imported outside /dev.
// Each preview gets its own copy (`createDeletionStore`), so scheduling, cancelling and deleting really change it.

import type { DeletionRequest, DeletionRequestInput } from "@/lib/api/types";

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();
const WAIT_DAYS = 30;

const samer = { id: 1, name: "سامر الحلبي" };
const hala = { id: 4, name: "هالة المدير" };

const request = (fields: Partial<DeletionRequest> & Pick<DeletionRequest, "id" | "subject_type" | "subject_id" | "source" | "status" | "requested_at">): DeletionRequest => ({
  subject_name: null,
  note: null,
  executes_at: null,
  executed_at: null,
  cancelled_at: null,
  handled_by: null,
  ...fields,
});

const seeds = (): DeletionRequest[] => [
  // Merchant 110 is in its waiting period (its page shows the same request, id 7)
  request({ id: 7, subject_type: "merchant", subject_id: 110, subject_name: "بقالة الحي", source: "support", status: "pending", note: "رسالة من المالكة: أغلقت المحل", requested_at: daysAgo(25), executes_at: inDays(5), handled_by: samer }),
  // Customers who deleted their own accounts from the app: done at once, by no admin
  request({ id: 12, subject_type: "customer", subject_id: 731, source: "app", status: "executed", requested_at: daysAgo(1), executed_at: daysAgo(1) }),
  request({ id: 11, subject_type: "customer", subject_id: 728, source: "app", status: "executed", requested_at: daysAgo(3), executed_at: daysAgo(3) }),
  request({ id: 10, subject_type: "customer", subject_id: 715, source: "app", status: "executed", requested_at: daysAgo(6), executed_at: daysAgo(6) }),
  request({ id: 9, subject_type: "customer", subject_id: 702, source: "support", status: "executed", note: "اتصل بالدعم ولا يستطيع الدخول", requested_at: daysAgo(12), executed_at: daysAgo(12), handled_by: hala }),
  // Merchant 107 changed their mind during the waiting period
  request({ id: 5, subject_type: "merchant", subject_id: 107, subject_name: "مكتبة الأفق", source: "support", status: "cancelled", note: "عدل عن قراره بعد أسبوع", requested_at: daysAgo(40), executes_at: daysAgo(10), cancelled_at: daysAgo(33), handled_by: samer }),
  // Merchant 111's deletion ran after the 30 days
  request({ id: 3, subject_type: "merchant", subject_id: 111, subject_name: "متجر أُغلق", source: "support", status: "executed", requested_at: daysAgo(90), executes_at: daysAgo(60), executed_at: daysAgo(60), handled_by: hala }),
];

export type CancelResult = { ok: true; data: DeletionRequest; merchantId: number } | { ok: false; code: "NOT_FOUND" | "DELETION_REQUEST_NOT_PENDING" };

export function createDeletionStore() {
  const requests = seeds();
  const nextId = () => Math.max(0, ...requests.map((item) => item.id)) + 1;

  return {
    /** Newest first, with the same two optional filters as the server. */
    list: (params: Record<string, string | undefined>) =>
      requests
        .filter((item) => (params.status ? item.status === params.status : true))
        .filter((item) => (params.subject_type ? item.subject_type === params.subject_type : true))
        .sort((a, b) => Date.parse(b.requested_at) - Date.parse(a.requested_at)),

    /** The waiting period starts now and ends in 30 days. */
    scheduleMerchant(merchant: { id: number; name: string }, body: DeletionRequestInput, by: { id: number; name: string }) {
      const created = request({
        id: nextId(),
        subject_type: "merchant",
        subject_id: merchant.id,
        subject_name: merchant.name,
        source: body.source,
        status: "pending",
        note: body.note ?? null,
        requested_at: new Date().toISOString(),
        executes_at: inDays(WAIT_DAYS),
        handled_by: by,
      });
      requests.push(created);
      return created;
    },

    deleteCustomer(customerId: number, body: DeletionRequestInput, by: { id: number; name: string }) {
      const now = new Date().toISOString();
      const created = request({
        id: nextId(),
        subject_type: "customer",
        subject_id: customerId,
        source: body.source,
        status: "executed",
        note: body.note ?? null,
        requested_at: now,
        executed_at: now,
        handled_by: by,
      });
      requests.push(created);
      return created;
    },

    cancel(id: number): CancelResult {
      const found = requests.find((item) => item.id === id);
      if (!found || found.subject_type !== "merchant") return { ok: false, code: "NOT_FOUND" };
      if (found.status !== "pending") return { ok: false, code: "DELETION_REQUEST_NOT_PENDING" };
      found.status = "cancelled";
      found.cancelled_at = new Date().toISOString();
      return { ok: true, data: found, merchantId: found.subject_id };
    },
  };
}
