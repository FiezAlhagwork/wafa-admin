import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

/** Title, description, canonical and hreflang links for a legal page in both locales. */
export async function legalMetadata(
  locale: Locale,
  namespace: "privacy" | "terms" | "deleteAccount",
  href: "/privacy" | "/terms" | "/delete-account",
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `${namespace}.meta` });
  const languages = Object.fromEntries(routing.locales.map((l) => [l, getPathname({ href, locale: l })]));

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: getPathname({ href, locale }),
      languages: { ...languages, "x-default": getPathname({ href, locale: routing.defaultLocale }) },
    },
    openGraph: { title: t("title"), description: t("description"), type: "article", locale },
  };
}
