import type { PaymentMethod, PaymentRejectionReason, PaymentStatus } from "@/lib/api/types";

export const methodLabels: Record<PaymentMethod, string> = {
  syriatel_cash: "سيريتل كاش",
  transfer: "حوالة",
};

export const rejectionReasonLabels: Record<PaymentRejectionReason, string> = {
  transfer_not_received: "الحوالة لم تصل",
  amount_short: "المبلغ ناقص",
  unclear_image: "الصورة غير واضحة",
  invalid_proof: "الإثبات غير صالح",
};

/** Each reason with a short line for the reviewer. The chosen one is sent to the merchant. */
export const rejectionReasonOptions: { value: PaymentRejectionReason; label: string; description: string }[] = [
  { value: "transfer_not_received", label: rejectionReasonLabels.transfer_not_received, description: "لم يصل المبلغ إلى الحساب" },
  { value: "amount_short", label: rejectionReasonLabels.amount_short, description: "وصل مبلغ أقل من المطلوب" },
  { value: "unclear_image", label: rejectionReasonLabels.unclear_image, description: "لا يمكن قراءة تفاصيل الإثبات" },
  { value: "invalid_proof", label: rejectionReasonLabels.invalid_proof, description: "الصورة لا تثبت عملية الدفع" },
];

export const statusTabs: { value: PaymentStatus; label: string }[] = [
  { value: "PENDING", label: "بانتظار المراجعة" },
  { value: "APPROVED", label: "مقبولة" },
  { value: "REJECTED", label: "مرفوضة" },
];

export function formatDuration(months: number): string {
  if (months === 1) return "شهر";
  if (months === 12) return "سنة";
  return `${months} أشهر`;
}
