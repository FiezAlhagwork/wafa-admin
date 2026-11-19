import { z } from "zod";
import { reasonField } from "@/components/ui";
import { todayKey } from "@/lib/format";

// Arabic-Indic digits are typed by some keyboards; the server wants Latin ones
const toLatinDigits = (value: string) => value.replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));

/** The two forms the server accepts: `09XXXXXXXX` and `+9639XXXXXXXX`. */
const SYRIAN_MOBILE = /^(?:09\d{8}|\+9639\d{8})$/;

export const phoneSearchSchema = z.object({
  phone: z
    .string()
    // Spaces and dashes are how people copy numbers; they are removed before checking and sending
    .transform((value) => toLatinDigits(value).replace(/[\s-]/g, ""))
    .pipe(
      z
        .string()
        .min(1, "أدخل رقم الهاتف")
        .regex(SYRIAN_MOBILE, "أدخل الرقم كاملاً: 09XXXXXXXX أو +9639XXXXXXXX"),
    ),
});
export type PhoneSearchInput = z.input<typeof phoneSearchSchema>;
export type PhoneSearchValues = z.output<typeof phoneSearchSchema>;

export const birthdateSchema = z.object({
  birthdate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "اختر تاريخ الميلاد")
    // Compared as "YYYY-MM-DD" strings with today in Damascus: the date field gives that form
    .refine((value) => value <= todayKey(), "التاريخ في المستقبل"),
  reason: reasonField,
});
export type BirthdateFormValues = z.infer<typeof birthdateSchema>;
