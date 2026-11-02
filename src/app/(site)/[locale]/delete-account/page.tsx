import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { DeleteAccount } from "@/site/legal/DeleteAccount";
import { legalMetadata } from "@/site/legal/metadata";
import { SiteFooter } from "@/site/layout/SiteFooter";
import { SiteHeader } from "@/site/layout/SiteHeader";

export async function generateMetadata({ params }: PageProps<"/[locale]/delete-account">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return legalMetadata(locale, "deleteAccount", "/delete-account");
}

export default async function DeleteAccountPage({ params }: PageProps<"/[locale]/delete-account">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader pathname="/delete-account" />
      <DeleteAccount />
      <SiteFooter />
    </>
  );
}
