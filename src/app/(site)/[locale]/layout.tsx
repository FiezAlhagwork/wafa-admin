import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { thmanyah } from "@/lib/fonts";
import "@/styles/globals.css";

// Canonical and hreflang links are built on this origin, and NEXT_PUBLIC_* is frozen at build time. A production
// build without the variable falls back to the live domain, never to localhost.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production" ? "https://wafacard.app" : "http://localhost:3000");

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "site" });
  // The pages set their own full titles; this is the title of a page that sets none (the home page for now)
  return { metadataBase: new URL(siteUrl), title: t("brand") };
}

// Only the locales from generateStaticParams exist: any other first segment is a 404 without reaching the layout
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function SiteRootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={thmanyah.variable}>
      <body className="min-h-dvh">
        {/* The website renders its text on the server, so no messages are sent to the browser. */}
        <NextIntlClientProvider messages={null}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
