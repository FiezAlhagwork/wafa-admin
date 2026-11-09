import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { siteNav } from "./site-nav";
import { focusRingOnBlue } from "./styles";

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
    // The header floats: a brand-blue box (white logo and links) the width of the content, a little below the top edge.
    // The page stays visible around it and scrolls behind it, so only the box takes clicks.
    <header className="pointer-events-none sticky top-0 z-20 px-3 pt-3 sm:px-6 sm:pt-5 print:static print:p-0">
      <a
        href="#content"
        className="sr-only rounded-md bg-brand px-3 py-2 text-sm text-brand-on focus:not-sr-only focus:absolute focus:start-4 focus:top-3"
      >
        {t("skipToContent")}
      </a>
      <div className="pointer-events-auto relative mx-auto max-w-6xl rounded-2xl bg-brand-deep text-neutral-0 shadow-popup print:rounded-none print:shadow-none">
        <div className="flex h-20 items-center gap-4 px-5 sm:px-8">
          {/*
            The transparent logo, painted with two masks of the same image: all of it white, then the two dots
            (the bottom-left corner of the image, which the clip cuts out) amber on top.
          */}
          <Link href="/" aria-label={t("brand")} className={cn("flex shrink-0 items-center rounded-2xl", focusRingOnBlue)}>
            <span aria-hidden className="relative block size-16">
              <span
                className="absolute inset-0 bg-neutral-0 mask-contain mask-center mask-no-repeat print:bg-brand-deep"
                style={{ maskImage: "url(/brand/wafa-logo.png)", WebkitMaskImage: "url(/brand/wafa-logo.png)" }}
              />
              <span
                className="absolute inset-0 bg-amber mask-contain mask-center mask-no-repeat print:bg-brand-deep"
                style={{
                  maskImage: "url(/brand/wafa-logo.png)",
                  WebkitMaskImage: "url(/brand/wafa-logo.png)",
                  clipPath: "inset(80% 64% 0 0)",
                }}
              />
            </span>
          </Link>

          <nav aria-label={t("nav.label")} className="mx-auto hidden items-center gap-2 lg:flex print:hidden">
            <NavLinks links={links} variant="bar" />
          </nav>

          <div className="ms-auto flex items-center gap-2 lg:ms-0 print:hidden">
            <Link
              href={pathname}
              locale={otherLocale}
              lang={otherLocale}
              aria-label={t("switchLocaleLabel")}
              className={cn(
                "inline-flex h-11 items-center rounded-full border border-neutral-0/30 px-5 text-base font-medium text-neutral-0 transition-colors hover:border-neutral-0/60",
                focusRingOnBlue,
              )}
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
      </div>
    </header>
  );
}
