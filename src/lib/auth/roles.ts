import type { AdminRole } from "@/lib/api/types";

/** Display only. Never branch on the role: check the permission (`usePermission` / `<Can>`). */
export const roleLabels: Record<AdminRole, string> = {
  super_admin: "مدير عام",
  admin: "مدير",
  payments_reviewer: "مراجع دفعات",
  support: "دعم",
};
