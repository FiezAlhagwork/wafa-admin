import { DeviceMobile, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui";
import { whatsappLink } from "./home-config";
import { StampCardPreview } from "./StampCardPreview";
import { linkButton } from "./styles";

export async function Hero() {
  const t = await getTranslations("home.hero");
  const tNav = await getTranslations("site.nav");

  return (
    <section className="overflow-hidden border-b border-border bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 pt-14 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:gap-12 lg:pb-24">
        <div className="flex flex-col items-start">
          <Badge tone="amber" dot>
            {t("eyebrow")}
          </Badge>
          <h1 className="mt-5 text-4xl leading-tight font-black text-fg sm:text-5xl lg:text-6xl">{t("title")}</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-fg-muted">{t("lead")}</p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a href={whatsappLink(tNav("joinMessage"))} target="_blank" rel="noopener noreferrer" className={linkButton("accent")}>
              <WhatsappLogo aria-hidden weight="fill" />
              {t("merchantCta")}
            </a>
            <a href="#download" className={linkButton("secondary")}>
              <DeviceMobile aria-hidden />
              {t("customerCta")}
            </a>
          </div>

          <p className="mt-4 text-sm text-fg-muted">{t("note")}</p>
        </div>

        <StampCardPreview />
      </div>
    </section>
  );
}
