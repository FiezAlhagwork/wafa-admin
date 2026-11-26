import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { About } from "@/site/home/About";
import { Faq } from "@/site/home/Faq";
import { Features } from "@/site/home/Features";
import { Hero } from "@/site/home/Hero";
import { HowItWorks } from "@/site/home/HowItWorks";
import { RevealOnScroll } from "@/site/home/RevealOnScroll";
import { homeMetadata } from "@/site/home/metadata";
import { SiteFooter } from "@/site/layout/SiteFooter";
import { SiteHeader } from "@/site/layout/SiteHeader";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return homeMetadata(locale);
}

export default async function SiteHomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader pathname="/" />
      <main id="content">
        <Hero />
        <About />
        <Features />
        <HowItWorks />
        <Faq />
      </main>
      <RevealOnScroll />
      <SiteFooter />
    </>
  );
}
