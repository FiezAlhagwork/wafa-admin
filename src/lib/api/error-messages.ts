import type { ApiError } from "./errors";

// User-facing Arabic text by `error.code`. The server's `message` is English for developers and is never shown.
// Only codes the dashboard can actually meet are listed; the app-only codes (OTP_*, PIN_*, QR_*...) use the fallback.

type Details = ApiError["details"];
type ErrorText = string | ((details: Details) => string);

export const FALLBACK_ERROR_MESSAGE = "حدث خطأ غير متوقع، حاول مرة أخرى";

const seconds = (details: Details) =>
  typeof details.retry_after_seconds === "number" ? details.retry_after_seconds : null;

export const errorMessages: Partial<Record<ApiError["code"], ErrorText>> = {
  // Client-side: the server never answered
  NETWORK_ERROR: "تعذّر الاتصال بالخادم، تحقّق من اتصالك بالإنترنت",
  UNKNOWN_ERROR: FALLBACK_ERROR_MESSAGE,

  UNAUTHENTICATED: "انتهت جلستك، سجّل الدخول من جديد",
  FORBIDDEN: "دورك لا يسمح بهذه العملية",
  NOT_FOUND: "العنصر غير موجود أو تم حذفه",
  VALIDATION_FAILED: "تحقّق من الحقول المُدخلة",
  SERVER_ERROR: "حدث خطأ في الخادم، حاول لاحقاً",
  RATE_LIMITED: (details) => {
    const wait = seconds(details);
    return wait === null ? "طلبات كثيرة، انتظر قليلاً ثم حاول مجدداً" : `طلبات كثيرة، حاول بعد ${wait} ثانية`;
  },

  // Admin actions: after any of these the item changed under us, so the caller refetches it
  PAYMENT_NOT_PENDING: ({ status }) => {
    if (status === "APPROVED") return "تمت الموافقة على هذه الدفعة مسبقاً";
    if (status === "REJECTED") return "تم رفض هذه الدفعة مسبقاً";
    return "تمت مراجعة هذه الدفعة مسبقاً";
  },
  TRIAL_NOT_EXTENDABLE: ({ reason }) => {
    if (reason === "paid") return "هذا التاجر دفع اشتراكه، والتمديد للتجربة فقط";
    if (reason === "no_trial") return "هذا التاجر ليس في فترة تجربة";
    return "حالة التاجر لا تسمح بتمديد التجربة";
  },
  MERCHANT_STATUS_CONFLICT: "حالة التاجر تغيّرت ولم تعد تسمح بهذه العملية",
  DELETION_REQUEST_NOT_PENDING: "تم تنفيذ هذا الطلب أو إلغاؤه مسبقاً",
  REWARD_ALREADY_REDEEMED: "تم تسليم الهدية بالفعل، لا يمكن إلغاء الختم",
};

/** `VALIDATION_FAILED` details.fields: each field maps to a list of rule names. */
export const fieldRuleMessages: Record<string, string> = {
  required: "هذا الحقل مطلوب",
  min: "القيمة أقل من الحد المسموح",
  max: "القيمة أكبر من الحد المسموح",
  size: "الحجم أو الطول غير مناسب",
  format: "الصيغة غير صحيحة",
  taken: "هذه القيمة مستخدمة مسبقاً",
  exists: "هذه القيمة غير موجودة",
  before: "التاريخ غير مقبول",
  prohibits: "لا يمكن الجمع بين هذا الحقل وحقل آخر",
  invalid: "القيمة غير صالحة",
};

export const FALLBACK_FIELD_MESSAGE = "القيمة غير صالحة";
