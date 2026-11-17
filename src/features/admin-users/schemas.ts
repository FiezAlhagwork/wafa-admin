import { z } from "zod";
import type { AdminRole } from "@/lib/api/types";

const adminRoles = ["super_admin", "admin", "payments_reviewer", "support"] as const satisfies readonly AdminRole[];

export const adminUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "أدخل الاسم (حرفان على الأقل)")
    .max(100, "الاسم طويل جداً"),
  email: z.email({ error: (issue) => (issue.input ? "صيغة البريد غير صحيحة" : "أدخل البريد الإلكتروني") }),
  role: z.enum(adminRoles, { error: "اختر الدور" }),
});

export type AdminUserFormValues = z.infer<typeof adminUserSchema>;
