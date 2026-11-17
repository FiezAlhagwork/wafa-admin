import type { RadioOption } from "@/components/ui";
import { roleLabels } from "@/lib/auth/roles";
import type { AdminRole } from "@/lib/api/types";

// What each role can do, as the backend guide's permission table (§5) lists it. It is only a hint for whoever picks the
// role: what a signed-in admin can actually do always comes from `permissions` of `GET /admin/auth/me`, never from here.
const roleDescriptions: Record<AdminRole, string> = {
  super_admin: "كل شيء ما عدا مراجعة الدفعات: الحسابات، الباقات والأسعار، الإعدادات، التمديد، المالية وسجل التدقيق.",
  admin: "التجار والزبائن (تعديل وإيقاف)، إلغاء الأختام، الأنواع والأيقونات وطلبات الحذف. بدون مالية أو أسعار.",
  payments_reviewer: "قبول الدفعات ورفضها، مع سجل الدفعات والتقارير المالية. لا يعدّل الأسعار ولا يمدّد التجربة.",
  support: "عرض التجار والزبائن، وتعديل الهوية وتاريخ الميلاد وعرض رقم الزبون. بدون إيقاف أو مالية.",
};

export const roleOptions: RadioOption<AdminRole>[] = (Object.keys(roleLabels) as AdminRole[]).map((role) => ({
  value: role,
  label: roleLabels[role],
  description: roleDescriptions[role],
}));
