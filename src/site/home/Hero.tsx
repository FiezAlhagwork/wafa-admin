import { DownloadSimple } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { StampCardPreview } from "./StampCardPreview";
import { linkButton } from "./styles";

export async function Hero() {
  const t = await getTranslations("home.hero");

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
            <Link href={{ pathname: "/", hash: "download" }} className={linkButton("accent")}>
              <DownloadSimple aria-hidden weight="bold" />
              {t("downloadCta")}
            </Link>
            <Link href={{ pathname: "/", hash: "how" }} className={linkButton("secondary")}>
              {t("howCta")}
            </Link>
          </div>
        </div>

        <StampCardPreview />
      </div>
    </section>
  );
}
