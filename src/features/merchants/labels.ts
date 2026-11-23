import type { AdminMerchant } from "@/lib/api/types";
import type { StatusFilter } from "./filters";

/** The status tabs of the list, in the merchant lifecycle order; the two registration steps last. */
export const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "", label: "الكل" },
  { value: "TRIAL", label: "تجربة" },
  { value: "ACTIVE", label: "فعّال" },
  { value: "GRACE", label: "فترة سماح" },
  { value: "EXPIRED", label: "منتهي" },
  { value: "SUSPENDED", label: "موقوف" },
  { value: "PENDING_DELETION", label: "بانتظار الحذف" },
  { value: "DELETED", label: "محذوف" },
  { value: "NO_PACKAGE", label: "قيد التسجيل · بدون باقة" },
  { value: "NO_PIN", label: "قيد التسجيل · بدون PIN" },
];

/** Where a merchant without a status stopped: `done` never shows (it has a status by then). */
export const registrationStepLabels: Record<AdminMerchant["registration_step"], string> = {
  package: "لم يختر باقة",
  pin: "لم يضع PIN",
  done: "مكتمل",
};

export const periodTypeLabels = { trial: "تجربة", paid: "مدفوعة" } as const;

export const cardStatusLabels = { active: "فعّالة", suspended: "موقوفة" } as const;
