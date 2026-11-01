// Arabic text for Clerk sign-in errors, by Clerk's error code. Clerk's own messages are English and never shown.

const messages: Record<string, string> = {
  form_identifier_not_found: "هذا البريد غير مسجّل",
  form_param_format_invalid: "صيغة البريد غير صحيحة",
  form_param_nil: "أدخل البريد الإلكتروني",
  form_code_incorrect: "الرمز غير صحيح",
  verification_expired: "انتهت صلاحية الرمز، اطلب رمزاً جديداً",
  verification_failed: "فشل التحقق، اطلب رمزاً جديداً",
  too_many_requests: "محاولات كثيرة، انتظر قليلاً ثم حاول مجدداً",
  session_exists: "أنت مسجّل الدخول مسبقاً",
};

export const FALLBACK_SIGN_IN_ERROR = "تعذّر تسجيل الدخول، حاول مرة أخرى";

/** Clerk errors may come as a field error ({ code }) or a ClerkError carrying `errors[0].code`. */
export function clerkErrorMessage(error: unknown): string | null {
  if (!error) return null;
  const code = extractCode(error);
  return (code && messages[code]) || FALLBACK_SIGN_IN_ERROR;
}

function extractCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  if ("code" in error && typeof error.code === "string") {
    // ClerkAPIResponseError has a generic top-level code; the specific one lives in errors[0]
    const first = "errors" in error && Array.isArray(error.errors) ? (error.errors[0] as unknown) : undefined;
    return extractCode(first) ?? error.code;
  }
  if ("errors" in error && Array.isArray(error.errors)) return extractCode(error.errors[0]);
  return undefined;
}
