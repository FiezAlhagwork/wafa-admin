import { z } from "zod";
import { ICON_KEY_PATTERN } from "./icon-key";

/**
 * The add/edit form. `key` is checked only when adding an icon (`withKey`); whether Phosphor really has that icon is
 * checked on submit, once the library has loaded (see LookupFormDialog).
 */
export const lookupSchema = (withKey: boolean) =>
  z.object({
    name: z.string().trim().min(2, "أدخل الاسم (حرفان على الأقل)").max(100, "الاسم طويل جداً"),
    key: withKey
      ? z
          .string()
          .trim()
          .min(1, "أدخل اسم الأيقونة في Phosphor")
          .max(64, "الاسم طويل جداً")
          .regex(ICON_KEY_PATTERN, "حروف إنجليزية صغيرة وأرقام و- فقط، مثل fork-knife")
      : z.string(),
    sort_order: z
      .string()
      .trim()
      .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) <= 65535), "رقم من 0 إلى 65535"),
  });

export type LookupFormValues = z.infer<ReturnType<typeof lookupSchema>>;
