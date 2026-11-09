import { AppleLogo, DownloadSimple, GooglePlayLogo } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroShowcase, type ShowcaseCard } from "./HeroShowcase";
import { linkButton } from "./styles";

type CardText = {
  key: string;
  label: string;
  shop: string;
  type: string;
  total: number;
  filled: number;
};

export async function Hero() {
  const t = await getTranslations("home.hero");

  // The picker swaps cards in the browser, so each card's text is built here and passed down ready.
  const cards: ShowcaseCard[] = (t.raw("cards") as CardText[]).map((card) => ({
    key: card.key,
    label: card.label,
    shop: card.shop,
    subtitle: `${card.label} · ${t("card.city")}`,
    name: card.type,
    total: card.total,
    filled: card.filled,
    of: t("card.of", { total: card.total }),
    pill: t("card.pill", { count: card.total - card.filled }),
    ariaLabel: t("card.label", { shop: card.shop, filled: card.filled, total: card.total }),
  }));

  return (
    <section className="overflow-hidden border-b border-border bg-bg">
      <HeroShowcase
        cards={cards}
        pickerLabel={t("pickerLabel")}
        giftLabel={t("card.gift")}
        intro={
          <>
            <h1 className="text-4xl leading-tight font-black text-fg sm:text-5xl lg:text-6xl">
              {t("titleLine1")}
              <span className="block text-brand">{t("titleLine2")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-fg-muted">{t("lead")}</p>
          </>
        }
        actions={
          <>
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href={{ pathname: "/", hash: "download" }} className={linkButton("accent", "h-14 px-8 text-lg")}>
                <DownloadSimple aria-hidden weight="bold" />
                {t("downloadCta")}
              </Link>
              <Link href={{ pathname: "/", hash: "how" }} className={linkButton("secondary", "h-14 px-8 text-lg")}>
                {t("howCta")}
              </Link>
            </div>

            <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-fg-muted">
              <span>{t("stores")}</span>
              <span className="inline-flex items-center gap-2 text-fg" dir="ltr">
                <GooglePlayLogo aria-hidden weight="fill" className="size-5" />
                Google Play
              </span>
              <span className="inline-flex items-center gap-2 text-fg" dir="ltr">
                <AppleLogo aria-hidden weight="fill" className="size-5" />
                App Store
              </span>
            </p>
          </>
        }
      />
    </section>
  );
}
