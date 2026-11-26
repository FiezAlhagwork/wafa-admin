import {
  BellSimpleSlash,
  DeviceMobile,
  MagnifyingGlass,
  QrCode,
  ShieldCheck,
  Storefront,
  User,
} from "@phosphor-icons/react/ssr";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import customerApp from "./customer-app.webp";
import { MerchantFeatures, type VisualText } from "./MerchantFeatures";
import { SectionHeading } from "./SectionHeading";
import { StampsBackdrop } from "./StampsBackdrop";

type Item = { title: string; text: string };

/** One icon per customer item, in the same order as home.features.customers.items. */
const customerIcons = [DeviceMobile, QrCode, MagnifyingGlass, BellSimpleSlash];

export async function Features() {
  const t = await getTranslations("home.features");
  const merchantItems = t.raw("merchants.items") as Item[];
  const merchantVisuals = t.raw("merchants.visuals") as VisualText;
  const customerItems = t.raw("customers.items") as Item[];

  return (
    <section id="features" aria-labelledby="features-title" className="relative scroll-mt-20 overflow-hidden py-16 sm:py-24">
      <StampsBackdrop variant="features" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6">
        <SectionHeading id="features-title" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} reveal="zoom" />

        {/* Merchants */}
        <div className="flex flex-col gap-6">
          <h3 data-reveal="start" className="flex items-center gap-2 text-xl font-bold text-fg">
            <Storefront aria-hidden weight="duotone" className="size-6 text-brand" />
            {t("merchants.title")}
          </h3>
          <MerchantFeatures items={merchantItems} visuals={merchantVisuals} />
        </div>

        {/* Customers: the app on a phone beside what it does for them */}
        <div
          data-reveal="start"
          className="grid items-center gap-10 overflow-hidden rounded-3xl bg-brand p-6 text-neutral-0 sm:p-10 lg:grid-cols-[2fr_3fr] lg:gap-14"
        >
          {/*
            A hand holding the customer app on its card list. The photo is cut off at the wrist, so it sits on the
            panel's bottom edge (the negative margin cancels the padding) and comes last on small screens.
          */}
          <Image
            src={customerApp}
            alt=""
            sizes="(min-width: 640px) 18rem, 16rem"
            className="order-last mx-auto -mb-6 w-64 self-end sm:-mb-10 sm:w-72 lg:order-none"
          />

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="flex items-center gap-2 text-base font-bold text-amber">
                <User aria-hidden weight="duotone" className="size-5" />
                {t("customers.title")}
              </h3>
              <p className="text-2xl leading-snug font-black sm:text-3xl">{t("customers.headline")}</p>
            </div>

            <ul className="grid gap-6 sm:grid-cols-2">
              {customerItems.map((item, index) => {
                const Icon = customerIcons[index];
                return (
                  <li key={index} className="flex gap-3">
                    {Icon && <Icon aria-hidden weight="duotone" className="mt-0.5 size-6 shrink-0 text-amber" />}
                    <div className="flex flex-col gap-1">
                      <h4 className="font-bold">{item.title}</h4>
                      <p className="leading-7 text-neutral-0/80">{item.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="flex items-start gap-2 border-t border-neutral-0/15 pt-5 text-neutral-0/80">
              <ShieldCheck aria-hidden weight="fill" className="mt-1 size-5 shrink-0 text-amber" />
              {t("customers.note")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
