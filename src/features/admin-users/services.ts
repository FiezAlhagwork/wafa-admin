import { api } from "@/lib/api/client";
import type { AdminUser, CreateAdminUserBody, UpdateAdminUserBody } from "@/lib/api/types";

/** GET /admin/admin-users: no cursor (a small team). The active accounts come first, sorted by name. */
export async function listAdminUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<{ data: AdminUser[] }>("/admin/admin-users");
  return data.data;
}

/** POST /admin/admin-users: `linked` is false until the owner of the email signs in with Clerk using that email. */
export async function createAdminUser(body: CreateAdminUserBody): Promise<AdminUser> {
  const { data } = await api.post<{ data: AdminUser }>("/admin/admin-users", body);
  return data.data;
}

/** PATCH /admin/admin-users/{id}: any of name, role, is_active; `email` only before the account is linked. */
export async function updateAdminUser({ id, ...body }: UpdateAdminUserBody & { id: number }): Promise<AdminUser> {
  const { data } = await api.patch<{ data: AdminUser }>(`/admin/admin-users/${id}`, body);
  return data.data;
}

/** DELETE /admin/admin-users/{id}: deactivates (`is_active: false`), never deletes, so the audit log keeps its author. */
export async function deactivateAdminUser(id: number): Promise<AdminUser> {
  const { data } = await api.delete<{ data: AdminUser }>(`/admin/admin-users/${id}`);
  return data.data;
}
