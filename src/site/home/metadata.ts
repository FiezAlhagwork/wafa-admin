import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

/** Title, description, canonical and hreflang links for the home page in both locales. */
export async function homeMetadata(locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "home.meta" });
  const href = "/";
  const languages = Object.fromEntries(routing.locales.map((l) => [l, getPathname({ href, locale: l })]));

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: getPathname({ href, locale }),
      languages: { ...languages, "x-default": getPathname({ href, locale: routing.defaultLocale }) },
    },
    openGraph: { title: t("title"), description: t("description"), type: "website", locale },
  };
}
