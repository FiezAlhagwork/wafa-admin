import { z } from "zod";
import type { AdminPaymentAccount, PaymentMethod, UpdatePaymentMethodBody } from "@/lib/api/types";

/** What each method asks for (guide: Sham Cash has an account code and a QR; Al Haram a recipient name and number). */
export const methodFields: Record<PaymentMethod, { accountLabel: string; recipient: boolean; qr: boolean }> = {
  sham_cash: { accountLabel: "رمز الحساب", recipient: false, qr: true },
  haram: { accountLabel: "رقم المستلم", recipient: true, qr: false },
};

/** QR pictures the server takes. */
export const QR_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const QR_MAX_BYTES = 2 * 1024 * 1024;
export const QR_RULE = "الصورة يجب أن تكون JPEG أو PNG أو WebP وحجمها حتى 2MB";

export function methodSchema(account: AdminPaymentAccount) {
  return z
    .object({
      account: z.string().trim().max(100, "حتى 100 حرف"),
      recipient_name: z.string().trim().max(100, "حتى 100 حرف"),
      note: z.string().trim().max(500, "حتى 500 حرف"),
      sort_order: z
        .string()
        .trim()
        .refine((value) => /^\d+$/.test(value) && Number(value) <= 1000, "رقم من 0 إلى 1000"),
    })
    // The server refuses an active method without an account; say it here instead of a 422
    .refine((values) => !account.is_active || values.account !== "", {
      message: "لا يمكن مسح الحساب والطريقة فعّالة. أوقفها أولاً.",
      path: ["account"],
    });
}

export type MethodValues = z.infer<ReturnType<typeof methodSchema>>;

export const toMethodValues = (account: AdminPaymentAccount): MethodValues => ({
  account: account.account ?? "",
  recipient_name: account.recipient_name ?? "",
  note: account.note ?? "",
  sort_order: String(account.sort_order),
});

/** Only what changed; an emptied text is sent as null, which clears it. */
export function methodBody(account: AdminPaymentAccount, values: MethodValues): UpdatePaymentMethodBody {
  const body: UpdatePaymentMethodBody = {};
  for (const name of ["account", "recipient_name", "note"] as const) {
    const after = values[name].trim();
    if (after !== (account[name] ?? "")) body[name] = after === "" ? null : after;
  }
  if (Number(values.sort_order) !== account.sort_order) body.sort_order = Number(values.sort_order);
  return body;
}
