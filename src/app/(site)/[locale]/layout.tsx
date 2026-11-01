import { notFound } from "next/navigation";
import { thmanyah } from "@/lib/fonts";
import "@/styles/globals.css";

// Temporary until next-intl is set up (step 6): src/i18n/routing.ts will own the locales.
const locales = ["ar", "en"] as const;
type Locale = (typeof locales)[number];

const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function SiteRootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={thmanyah.variable}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
