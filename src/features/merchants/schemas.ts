import { z } from "zod";
import { REASON_MAX, REASON_MIN } from "@/components/ui";

// The server's rules (openapi.yaml), checked before sending. The server checks again; its 422 lands next to the field.

const reason = z
  .string()
  .trim()
  .min(REASON_MIN, `اكتب السبب (${REASON_MIN} أحرف على الأقل)`)
  .max(REASON_MAX, `السبب أطول من ${REASON_MAX} حرفاً`);

/** Suspend, reactivate, remove the cover, suspend a card: the reason only. */
export const reasonSchema = z.object({ reason });
export type ReasonFormValues = z.infer<typeof reasonSchema>;

export const identitySchema = z.object({
  business_name: z.string().trim().min(2, "أدخل اسم النشاط (حرفان على الأقل)").max(80, "الاسم أطول من 80 حرفاً"),
  /** The Select works with strings; it becomes a number again when sent. */
  business_type_id: z.string(),
  reason,
});
export type IdentityFormValues = z.infer<typeof identitySchema>;

export const TRIAL_DAYS_MAX = 90;

export const extendTrialSchema = z.object({
  days: z
    .string()
    .trim()
    .regex(/^\d+$/, "أدخل عدد الأيام بالأرقام")
    .transform(Number)
    .pipe(z.number().min(1, "يوم واحد على الأقل").max(TRIAL_DAYS_MAX, `${TRIAL_DAYS_MAX} يوماً كحد أقصى`)),
  reason,
});
export type ExtendTrialFormInput = z.input<typeof extendTrialSchema>;
export type ExtendTrialFormValues = z.output<typeof extendTrialSchema>;
