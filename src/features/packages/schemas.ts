import { z } from "zod";
import type { PackageDuration } from "@/lib/api/types";

/** The form field of each duration's price. */
export const priceField = (months: PackageDuration) => `price_${months}` as const;

// A whole number in a range, typed as text (the inputs keep what was typed; body.ts turns it into a number)
const wholeNumber = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `أدخل ${label}`)
    .regex(/^\d+$/, "أدخل رقماً صحيحاً")
    .refine((value) => Number(value) >= min && Number(value) <= max, `من ${min} إلى ${max}`);

// Dollars with up to two decimals, at least 0.01; empty means "not sold for this duration"
const price = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{1,6}(\.\d{1,2})?$/.test(value), "أدخل مبلغاً مثل 18 أو 18.50")
  .refine((value) => value === "" || /[1-9]/.test(value), "السعر أكبر من صفر");

export const packageSchema = z
  .object({
    name: z.string().trim().min(2, "أدخل اسم الباقة (حرفان على الأقل)").max(100, "الاسم طويل جداً"),
    cards_limit: wholeNumber(1, 20, "عدد البطاقات"),
    weekly_campaigns_limit: wholeNumber(0, 20, "عدد الحملات"),
    sort_order: z
      .string()
      .trim()
      .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) <= 1000), "رقم من 0 إلى 1000"),
    price_1: price,
    price_3: price,
    price_12: price,
  })
  .refine((values) => values.price_1 !== "" || values.price_3 !== "" || values.price_12 !== "", {
    message: "أدخل سعراً لمدة واحدة على الأقل",
    // Not one field: shown above the three prices (errors.root)
    path: ["root"],
  });

export type PackageFormValues = z.infer<typeof packageSchema>;
