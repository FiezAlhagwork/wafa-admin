import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const linkClass =
  "rounded text-fg-muted underline-offset-4 outline-none hover:text-fg hover:underline focus-visible:ring-2 focus-visible:ring-focus";

export async function SiteFooter() {
  const t = await getTranslations("site.footer");

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-fg-muted">{t("rights", { year: new Date().getFullYear() })}</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 print:hidden">
          <Link href="/privacy" className={linkClass}>
            {t("privacy")}
          </Link>
          <Link href="/terms" className={linkClass}>
            {t("terms")}
          </Link>
          <Link href="/delete-account" className={linkClass}>
            {t("deleteAccount")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
