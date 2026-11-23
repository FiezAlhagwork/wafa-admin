import { api } from "@/lib/api/client";
import type { AdminCardCycle, AdminCustomer, UpdateCustomerBirthdateBody } from "@/lib/api/types";

/** GET /admin/customers?phone=: by the full number only (no browsing). One customer or none; the number comes back masked. */
export async function findCustomer(phone: string): Promise<AdminCustomer | null> {
  const { data } = await api.get<{ data: AdminCustomer[] }>("/admin/customers", { params: { phone } });
  return data.data[0] ?? null;
}

/** GET /admin/customers/{id}: with all their cycles, most recent activity first. A deleted customer is a 404. */
export async function getCustomer(id: number): Promise<AdminCustomer> {
  const { data } = await api.get<{ data: AdminCustomer }>(`/admin/customers/${id}`);
  return data.data;
}

/** PATCH /admin/customers/{id}: after checking who the customer is. UNDER_AGE below 13. */
export async function updateCustomerBirthdate({
  id,
  ...body
}: { id: number } & UpdateCustomerBirthdateBody): Promise<AdminCustomer> {
  const { data } = await api.patch<{ data: AdminCustomer }>(`/admin/customers/${id}`, body);
  return data.data;
}

/** POST /admin/customers/{id}/reveal-phone: the full number. Every call is written to the audit log. */
export async function revealCustomerPhone(id: number): Promise<string> {
  const { data } = await api.post<{ data: { phone: string } }>(`/admin/customers/${id}/reveal-phone`);
  return data.data.phone;
}

/** GET /admin/card-cycles/{id}: the cycle with its stamps in order, the cancelled ones too. */
export async function getCardCycle(id: number): Promise<AdminCardCycle> {
  const { data } = await api.get<{ data: AdminCardCycle }>(`/admin/card-cycles/${id}`);
  return data.data;
}

/** POST /admin/stamps/{id}/cancel: marked cancelled, never deleted. If it completed the card, the cycle collects again. */
export async function cancelStamp({ id, reason }: { id: number; reason: string }): Promise<void> {
  await api.post(`/admin/stamps/${id}/cancel`, { reason });
}
