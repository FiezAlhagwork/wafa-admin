import { z } from "zod";
import { normalizeAmount } from "@/lib/format";
import type { SettingField, SettingsSection } from "./sections";

/** A section's form: every field as typed text (the inputs keep what was typed; numbers are converted when sent). */
export type SectionValues = Record<string, string>;
/** The stored settings: flat, numbers and strings. */
type StoredSettings = Record<string, string | number>;

const fieldsOf = (section: SettingsSection) => Object.entries(section.fields) as [string, SettingField][];

function fieldSchema(field: SettingField) {
  const text = z.string().trim();
  switch (field.kind) {
    case "int":
      return text
        .min(1, "أدخل قيمة")
        .regex(/^\d+$/, "أدخل رقماً صحيحاً")
        .refine((value) => Number(value) >= field.min && Number(value) <= field.max, `من ${field.min} إلى ${field.max}`);
    case "money":
      return text
        .min(1, "أدخل سعر الصرف")
        .regex(/^\d{1,9}(\.\d{1,2})?$/, "أدخل رقماً مثل 13000 أو 13000.50")
        // At least 1, read from the text: "0.xx" and "0" are below it
        .refine((value) => /^0*[1-9]/.test(value), "سعر الصرف من 1 فأكثر");
    case "text":
    case "textarea":
      return text.min(1, "أدخل قيمة").max(field.maxLength, `حتى ${field.maxLength} حرف`);
    case "url":
      return text
        .min(1, "أدخل الرابط")
        .max(500, "الرابط أطول من 500 حرف")
        .regex(/^https:\/\/\S+$/, "يجب أن يبدأ الرابط بـ https://");
    case "version":
      return text.refine((value) => value === "" || /^\d+\.\d+\.\d+$/.test(value), "بالشكل 1.2.0");
  }
}

export function sectionSchema(section: SettingsSection) {
  const shape = Object.fromEntries(fieldsOf(section).map(([name, field]) => [name, fieldSchema(field)]));
  const schema = z.object(shape);
  if (section.source !== "app" || !("card_stamps_min" in section.fields)) return schema;
  // Like the server (`invalid`): the minimum never goes above the maximum
  return schema.refine(
    (values) => Number(values.card_stamps_min) <= Number(values.card_stamps_max),
    { message: "الأقل لا يتجاوز الأكبر", path: ["card_stamps_min"] },
  );
}

export function toFormValues(section: SettingsSection, stored: StoredSettings): SectionValues {
  return Object.fromEntries(fieldsOf(section).map(([name]) => [name, String(stored[name] ?? "")]));
}

/**
 * Only the fields that changed (the server applies each field sent). Whole numbers and the exchange rate go as
 * numbers (a type conversion for the request, no math); an emptied version goes as null ("no minimum").
 */
export function changedBody(section: SettingsSection, stored: StoredSettings, values: SectionValues) {
  const body: Record<string, string | number | null> = {};
  for (const [name, field] of fieldsOf(section)) {
    const before = String(stored[name] ?? "");
    const after = values[name].trim();
    switch (field.kind) {
      case "int":
        if (Number(after) !== Number(before)) body[name] = Number(after);
        break;
      case "money":
        if (normalizeAmount(after) !== normalizeAmount(before)) body[name] = Number(normalizeAmount(after));
        break;
      case "version":
        if (after !== before) body[name] = after === "" ? null : after;
        break;
      default:
        if (after !== before) body[name] = after;
    }
  }
  return body;
}
