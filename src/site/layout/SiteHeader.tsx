import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

type SiteHeaderProps = {
  /** Path of the current page without the locale prefix, so the switch keeps the reader on the same page. */
  pathname: string;
};

export async function SiteHeader({ pathname }: SiteHeaderProps) {
  const t = await getTranslations("site");
  const locale = (await getLocale()) as Locale;
  const otherLocale: Locale = locale === "ar" ? "en" : "ar";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur print:static print:border-0">
      <a
        href="#content"
        className="sr-only rounded-md bg-brand px-3 py-2 text-sm text-brand-on focus:not-sr-only focus:absolute focus:start-4 focus:top-3"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
        >
          <Image src="/brand/wafa-logo.png" alt={t("brand")} width={44} height={44} priority className="size-11" />
        </Link>
        <Link
          href={pathname}
          locale={otherLocale}
          lang={otherLocale}
          aria-label={t("switchLocaleLabel")}
          className="inline-flex h-9 items-center rounded-full border border-border px-4 text-sm font-medium text-fg transition-colors outline-none hover:border-border-strong hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 print:hidden"
        >
          {t("switchLocale")}
        </Link>
      </div>
    </header>
  );
}
