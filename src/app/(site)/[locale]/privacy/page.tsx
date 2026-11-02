import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { legalMetadata } from "@/site/legal/metadata";
import { PrivacyPolicy } from "@/site/legal/PrivacyPolicy";
import { SiteFooter } from "@/site/layout/SiteFooter";
import { SiteHeader } from "@/site/layout/SiteHeader";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return legalMetadata(locale, "privacy", "/privacy");
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader pathname="/privacy" />
      <PrivacyPolicy />
      <SiteFooter />
    </>
  );
}
