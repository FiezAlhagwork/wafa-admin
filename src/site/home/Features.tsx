import {
  BellSimpleSlash,
  Cake,
  ChartLineUp,
  DeviceMobile,
  MagnifyingGlass,
  Megaphone,
  Palette,
  QrCode,
  ShieldCheck,
  Storefront,
  User,
} from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";
import { SectionHeading } from "./SectionHeading";

type Item = { title: string; text: string };

/** One icon per item, in the same order as home.features.merchants.items / customers.items. */
const merchantIcons = [Palette, QrCode, Megaphone, Cake, ChartLineUp, Storefront];
const customerIcons = [DeviceMobile, QrCode, MagnifyingGlass, BellSimpleSlash];

/** Icon box colors for the merchant cards, cycling through the brand's soft tints. */
const merchantTints = [
  "bg-amber-soft text-ink",
  "bg-teal-soft text-success",
  "bg-brand-soft text-brand",
  "bg-info-soft text-info",
  "bg-amber-soft text-ink",
  "bg-teal-soft text-success",
];

export async function Features() {
  const t = await getTranslations("home.features");
  const merchantItems = t.raw("merchants.items") as Item[];
  const customerItems = t.raw("customers.items") as Item[];

  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6">
        <SectionHeading id="features-title" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

        {/* Merchants */}
        <div className="flex flex-col gap-6">
          <h3 className="flex items-center gap-2 text-xl font-bold text-fg">
            <Storefront aria-hidden weight="duotone" className="size-6 text-brand" />
            {t("merchants.title")}
          </h3>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {merchantItems.map((item, index) => {
              const Icon = merchantIcons[index];
              return (
                <li
                  key={index}
                  className="flex flex-col gap-3 rounded-xl border-2 border-ink bg-surface p-6 shadow-[4px_4px_0_var(--color-ink)]"
                >
                  <span
                    className={cn(
                      "grid size-12 place-items-center rounded-xl border-2 border-ink",
                      merchantTints[index % merchantTints.length],
                    )}
                  >
                    {Icon && <Icon aria-hidden weight="duotone" className="size-6" />}
                  </span>
                  <h4 className="text-lg font-bold text-fg">{item.title}</h4>
                  <p className="leading-7 text-fg-muted">{item.text}</p>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Customers: the same dark card as the stamp card in the hero */}
        <div className="grid gap-8 rounded-3xl bg-ink p-6 text-neutral-0 sm:p-10 lg:grid-cols-[1fr_2fr] lg:gap-12">
          <div className="flex flex-col gap-4">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <User aria-hidden weight="duotone" className="size-6 text-amber" />
              {t("customers.title")}
            </h3>
            <p className="flex items-start gap-2 text-neutral-0/80">
              <ShieldCheck aria-hidden weight="fill" className="mt-1 size-5 shrink-0 text-amber" />
              {t("customers.note")}
            </p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2">
            {customerItems.map((item, index) => {
              const Icon = customerIcons[index];
              return (
                <li key={index} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-neutral-0/10 text-amber">
                    {Icon && <Icon aria-hidden weight="duotone" className="size-6" />}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="leading-7 text-neutral-0/80">{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
