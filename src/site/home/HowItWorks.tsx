import { Gift, Palette, QrCode, type Icon } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "./SectionHeading";
import { StampsBackdrop } from "./StampsBackdrop";

type Step = { title: string; text: string };

/** One icon per step, in the same order as home.how.steps. */
const icons: Icon[] = [Palette, QrCode, Gift];

/** The three steps, strung along a dashed line like the outline of an empty stamp. */
export async function HowItWorks() {
  const t = await getTranslations("home.how");
  const steps = t.raw("steps") as Step[];

  return (
    <section id="how" aria-labelledby="how-title" className="relative scroll-mt-20 overflow-hidden py-16 sm:py-24">
      <StampsBackdrop variant="how" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6">
        <SectionHeading id="how-title" eyebrow={t("eyebrow")} title={t("title")} />

        <ol className="relative grid gap-10 sm:grid-cols-3 sm:gap-6">
          {/* The line joining the three steps; it only makes sense once they sit side by side */}
          <span
            aria-hidden
            className="absolute inset-x-[16%] top-7 hidden border-t-2 border-dashed border-border-strong sm:block"
          />

          {steps.map((step, index) => {
            const Icon = icons[index] ?? Palette;
            return (
              <li key={index} className="relative flex flex-col items-center gap-2 text-center">
                <span className="grid size-14 place-items-center rounded-full border-4 border-bg bg-amber text-ink">
                  <Icon aria-hidden weight="fill" className="size-7" />
                </span>
                {/* The number goes in as text: as a number, Arabic would format it with Arabic-Indic digits */}
                <span className="mt-1 text-sm font-bold text-brand">{t("step", { number: String(index + 1) })}</span>
                <h3 className="text-xl font-bold text-fg">{step.title}</h3>
                <p className="max-w-xs leading-7 text-fg-muted">{step.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
