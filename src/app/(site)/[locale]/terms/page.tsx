import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { TermsOfUse } from "@/site/legal/TermsOfUse";
import { legalMetadata } from "@/site/legal/metadata";
import { SiteFooter } from "@/site/layout/SiteFooter";
import { SiteHeader } from "@/site/layout/SiteHeader";

export async function generateMetadata({ params }: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return legalMetadata(locale, "terms", "/terms");
}

export default async function TermsPage({ params }: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader pathname="/terms" />
      <TermsOfUse />
      <SiteFooter />
    </>
  );
}
