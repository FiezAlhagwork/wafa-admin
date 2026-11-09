import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { focusRing } from "@/components/ui/styles";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { siteNav } from "./site-nav";

type SiteHeaderProps = {
  /** Path of the current page without the locale prefix, so the switch keeps the reader on the same page. */
  pathname: string;
};

export async function SiteHeader({ pathname }: SiteHeaderProps) {
  const t = await getTranslations("site");
  const locale = (await getLocale()) as Locale;
  const otherLocale: Locale = locale === "ar" ? "en" : "ar";

  const links = siteNav.map((section) => ({ section, label: t(`nav.${section}`) }));

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur print:static print:border-0">
      <a
        href="#content"
        className="sr-only rounded-md bg-brand px-3 py-2 text-sm text-brand-on focus:not-sr-only focus:absolute focus:start-4 focus:top-3"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className={cn("flex shrink-0 items-center rounded-lg", focusRing)}>
          <Image src="/brand/wafa-logo.png" alt={t("brand")} width={44} height={44} priority className="size-11" />
        </Link>

        <nav aria-label={t("nav.label")} className="mx-auto hidden items-center gap-1 lg:flex print:hidden">
          <NavLinks links={links} variant="bar" />
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-0 print:hidden">
          <Link
            href={pathname}
            locale={otherLocale}
            lang={otherLocale}
            aria-label={t("switchLocaleLabel")}
            className="inline-flex h-9 items-center rounded-full border border-border px-4 text-sm font-medium text-fg transition-colors outline-none hover:border-border-strong hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          >
            {t("switchLocale")}
          </Link>
          <div className="lg:hidden">
            <MobileMenu
              links={links}
              navLabel={t("nav.label")}
              openLabel={t("nav.openMenu")}
              closeLabel={t("nav.closeMenu")}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
