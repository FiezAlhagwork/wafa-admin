/**
 * The two lists on the lookups screen. They share the API shape and the screen, so everything that differs between
 * them (the endpoint, whether there is a `key`, and every sentence, in its own grammatical gender) lives here.
 */
export type LookupKind = "types" | "icons";

export const lookupKinds = ["types", "icons"] as const satisfies LookupKind[];

type KindText = {
  path: string;
  hasKey: boolean;
  tab: string;
  add: string;
  createTitle: string;
  createDescription: string;
  editTitle: (name: string) => string;
  nameLabel: string;
  nameHint?: string;
  created: string;
  createdDescription: string;
  saved: string;
  inactive: string;
  empty: { title: string; description: string };
  deactivate: { heading: string; text: string; button: string; confirm: (name: string) => string; done: string; doneDescription: string };
  reactivate: { heading: string; text: string; confirm: (name: string) => string; done: string; doneDescription: string };
};

export const kindText: Record<LookupKind, KindText> = {
  types: {
    path: "/admin/business-types",
    hasKey: false,
    tab: "أنواع النشاط",
    add: "إضافة نوع",
    createTitle: "إضافة نوع نشاط",
    createDescription: "يظهر النوع الفعّال للتجار عند التسجيل فور إضافته.",
    editTitle: (name) => `تعديل «${name}»`,
    nameLabel: "اسم النوع",
    created: "تمت إضافة النوع",
    createdDescription: "يظهر الآن للتجار عند التسجيل.",
    saved: "تم حفظ النوع",
    inactive: "معطّل",
    empty: { title: "لا توجد أنواع نشاط", description: "أضف أول نوع ليختاره التجار عند التسجيل." },
    deactivate: {
      heading: "تعطيل النوع",
      text: "يختفي من قائمة التسجيل، ويبقى التجار الحاليون عليه. لا تُحذف الأنواع.",
      button: "تعطيل النوع",
      confirm: (name) => `«${name}» لن يظهر للتجار الجدد عند التسجيل. التجار الحاليون يحتفظون بنوعهم.`,
      done: "تم تعطيل النوع",
      doneDescription: "لم يعد يظهر عند التسجيل.",
    },
    reactivate: {
      heading: "النوع معطّل",
      text: "لا يظهر للتجار عند التسجيل حتى تُعيد تفعيله.",
      confirm: (name) => `«${name}» سيظهر من جديد للتجار عند التسجيل.`,
      done: "تمت إعادة تفعيل النوع",
      doneDescription: "يظهر من جديد عند التسجيل.",
    },
  },
  icons: {
    path: "/admin/icons",
    hasKey: true,
    tab: "أيقونات البطاقات",
    add: "إضافة أيقونة",
    createTitle: "إضافة أيقونة",
    createDescription: "تظهر الأيقونة الفعّالة للتجار عند إنشاء بطاقة فور إضافتها.",
    editTitle: (name) => `تعديل أيقونة «${name}»`,
    nameLabel: "اسم الأيقونة",
    nameHint: "بالعربية، كما يراه التاجر عند اختيار الأيقونة.",
    created: "تمت إضافة الأيقونة",
    createdDescription: "تظهر الآن للتجار عند إنشاء بطاقة.",
    saved: "تم حفظ الأيقونة",
    inactive: "معطّلة",
    empty: { title: "لا توجد أيقونات", description: "أضف أول أيقونة ليختارها التجار لبطاقاتهم." },
    deactivate: {
      heading: "تعطيل الأيقونة",
      text: "تختفي عند إنشاء بطاقة جديدة، وتبقى البطاقات الحالية بأيقونتها. لا تُحذف الأيقونات.",
      button: "تعطيل الأيقونة",
      confirm: (name) => `«${name}» لن تظهر عند إنشاء بطاقة جديدة. البطاقات الحالية تحتفظ بأيقونتها.`,
      done: "تم تعطيل الأيقونة",
      doneDescription: "لم تعد تظهر عند إنشاء بطاقة.",
    },
    reactivate: {
      heading: "الأيقونة معطّلة",
      text: "لا تظهر للتجار عند إنشاء بطاقة حتى تُعيد تفعيلها.",
      confirm: (name) => `«${name}» ستظهر من جديد للتجار عند إنشاء بطاقة.`,
      done: "تمت إعادة تفعيل الأيقونة",
      doneDescription: "تظهر من جديد عند إنشاء بطاقة.",
    },
  },
};

/** The tab in the URL: `?tab=icons`; the business types are the default (no parameter). */
export const parseKind = (value: string | null): LookupKind => (value === "icons" ? "icons" : "types");
