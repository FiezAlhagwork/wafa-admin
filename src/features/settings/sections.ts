import {
  ClockCountdown,
  CurrencyCircleDollar,
  DeviceMobile,
  LinkSimple,
  Megaphone,
  Stamp,
  type Icon,
} from "@phosphor-icons/react";
import type { IconTone } from "@/components/ui";
import { formatCount, formatDayCount, type CountForms } from "@/lib/format";
import type { AppSettings, BillingSettings } from "@/lib/api/types";

const minutes: CountForms = ["دقيقة واحدة", "دقيقتان", "دقائق", "دقيقة", "دقيقة"];
const hours: CountForms = ["ساعة واحدة", "ساعتان", "ساعات", "ساعة", "ساعة"];
const seconds: CountForms = ["ثانية واحدة", "ثانيتان", "ثوانٍ", "ثانية", "ثانية"];
const characters: CountForms = ["حرف واحد", "حرفان", "أحرف", "حرفاً", "حرف"];

type FieldBase = { label: string; hint?: string };

/** A whole number in a range, shown with its unit. */
type IntField = FieldBase & { kind: "int"; min: number; max: number; show: (value: number) => string };
/** Syrian pounds for one dollar (a decimal string from the server, a number in the request). */
type MoneyField = FieldBase & { kind: "money" };
type TextField = FieldBase & { kind: "text" | "textarea"; maxLength: number; ltr?: boolean };
/** https only, up to 500 characters. */
type UrlField = FieldBase & { kind: "url" };
/** X.Y.Z, or empty for "no minimum" (sent as null). */
type VersionField = FieldBase & { kind: "version" };

export type SettingField = IntField | MoneyField | TextField | UrlField | VersionField;

type SectionBase = {
  title: string;
  description: string;
  icon: Icon;
  iconTone: IconTone;
  /** What a change does, shown while editing. */
  note: string;
  noteTone?: "info" | "warning";
};

type BillingSection = SectionBase & { source: "billing"; fields: Partial<Record<keyof BillingSettings, SettingField>> };
type AppSection = SectionBase & { source: "app"; fields: Partial<Record<keyof AppSettings, SettingField>> };
export type SettingsSection = BillingSection | AppSection;

export const sections = {
  payment: {
    source: "billing",
    title: "الدفع",
    description: "سعر الصرف الذي تُحسب به المبالغ بالليرة في تطبيق التاجر.",
    icon: CurrencyCircleDollar,
    iconTone: "amber",
    note: "يطبَّق على الدفعات الجديدة فقط، وكل دفعة تحفظ سعرها.",
    fields: {
      exchange_rate_syp: { kind: "money", label: "سعر الصرف", hint: "ليرة سورية مقابل الدولار الواحد، من 1." },
    },
  },
  trial: {
    source: "billing",
    title: "التجربة والمراجعة",
    description: "مدة التجربة المجانية، ومهلة ما بعد انتهاء الاشتراك، ووقت مراجعة الدفعات.",
    icon: ClockCountdown,
    iconTone: "info",
    note: "مدة التجربة للتجارب الجديدة فقط، والمهلة للدفعات التي تُقبل بعد الحفظ. بعد مدة المراجعة تُعلَّم الدفعة المعلّقة متأخرة.",
    fields: {
      trial_days: { kind: "int", label: "التجربة المجانية", min: 1, max: 90, show: formatDayCount, hint: "بالأيام، من 1 إلى 90." },
      grace_days: {
        kind: "int",
        label: "المهلة بعد انتهاء الاشتراك",
        min: 0,
        max: 30,
        show: (value) => (value === 0 ? "بدون مهلة" : formatDayCount(value)),
        hint: "بالأيام، من 0 إلى 30.",
      },
      payment_review_sla_hours: {
        kind: "int",
        label: "مدة مراجعة الدفعة",
        min: 1,
        max: 168,
        show: (value) => formatCount(value, hours),
        hint: "بالساعات، من 1 إلى 168. بعدها تُعلَّم الدفعة متأخرة.",
      },
    },
  },
  stamps: {
    source: "app",
    title: "الطوابع ورمز QR",
    description: "قواعد الختم وعدد طوابع البطاقة.",
    icon: Stamp,
    iconTone: "teal",
    note: "يطبَّق فوراً في تطبيقَي التاجر والزبون.",
    fields: {
      stamp_interval_minutes: {
        kind: "int",
        label: "أقل وقت بين طابعين",
        min: 0,
        max: 1440,
        show: (value) => (value === 0 ? "بدون انتظار" : formatCount(value, minutes)),
        hint: "لنفس الزبون على نفس البطاقة، بالدقائق من 0 إلى 1440.",
      },
      card_stamps_min: { kind: "int", label: "أقل عدد طوابع للبطاقة", min: 1, max: 50, show: String, hint: "من 1 إلى 50." },
      card_stamps_max: { kind: "int", label: "أكبر عدد طوابع للبطاقة", min: 1, max: 50, show: String, hint: "من 1 إلى 50." },
      qr_period_seconds: {
        kind: "int",
        label: "عمر رمز QR",
        min: 15,
        max: 600,
        show: (value) => formatCount(value, seconds),
        hint: "بالثواني، من 15 إلى 600.",
      },
    },
  },
  campaigns: {
    source: "app",
    title: "الحملات",
    description: "طول الرسائل التي يرسلها التاجر لزبائنه.",
    icon: Megaphone,
    iconTone: "brand",
    note: "يطبَّق فوراً في تطبيق التاجر على الحملات الجديدة.",
    fields: {
      campaign_title_max: {
        kind: "int",
        label: "أطول عنوان",
        min: 10,
        max: 255,
        show: (value) => formatCount(value, characters),
        hint: "بالأحرف، من 10 إلى 255.",
      },
      campaign_body_max: {
        kind: "int",
        label: "أطول نص",
        min: 20,
        max: 2000,
        show: (value) => formatCount(value, characters),
        hint: "بالأحرف، من 20 إلى 2000.",
      },
    },
  },
  merchantApp: {
    source: "app",
    title: "تطبيق التاجر",
    description: "الإصدار المسموح ورابط التنزيل وجلسة رمز الدخول.",
    icon: DeviceMobile,
    iconTone: "neutral",
    note: "أي نسخة أقدم من الإصدار الأدنى تُمنع من العمل حتى يحدّثها التاجر من رابط التنزيل.",
    noteTone: "warning",
    fields: {
      merchant_min_app_version: {
        kind: "version",
        label: "أقدم إصدار مسموح",
        hint: "بالشكل 1.2.0. اتركه فارغاً إذا لا يوجد حد أدنى.",
      },
      merchant_app_download_url: { kind: "url", label: "رابط تنزيل التطبيق", hint: "يبدأ بـ https://" },
      pin_unlock_hours: {
        kind: "int",
        label: "مدة الجلسة بعد رمز الدخول",
        min: 1,
        max: 72,
        show: (value) => formatCount(value, hours),
        hint: "بالساعات، من 1 إلى 72.",
      },
    },
  },
  links: {
    source: "app",
    title: "الروابط",
    description: "الصفحات التي تفتحها التطبيقات.",
    icon: LinkSimple,
    iconTone: "brand",
    note: "تتغيّر الروابط في التطبيقات فوراً. تأكّد أن الصفحة تفتح قبل الحفظ.",
    fields: {
      privacy_policy_url: { kind: "url", label: "سياسة الخصوصية" },
      customer_terms_url: { kind: "url", label: "شروط الزبون" },
      merchant_terms_url: { kind: "url", label: "شروط التاجر" },
      support_url: { kind: "url", label: "التواصل مع الدعم", hint: "رابط وليس رقماً، مثل https://wa.me/963…" },
    },
  },
} satisfies Record<string, SettingsSection>;

export type SectionId = keyof typeof sections;

export const billingSectionIds = ["payment", "trial"] as const satisfies readonly SectionId[];
export const appSectionIds = ["stamps", "campaigns", "merchantApp", "links"] as const satisfies readonly SectionId[];
