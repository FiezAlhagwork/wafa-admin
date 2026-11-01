import { api } from "@/lib/api/client";
import type { AdminMeResponse, AdminPermission, AdminUser } from "@/lib/api/types";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export type Me = { user: AdminUser; permissions: AdminPermission[] };

/** GET /admin/auth/me: the first request after sign-in. 403 FORBIDDEN = not an active admin account. */
export async function getMe(): Promise<Me> {
  const { data } = await api.get<AdminMeResponse>("/admin/auth/me");
  return { user: data.data, permissions: data.permissions };
}
