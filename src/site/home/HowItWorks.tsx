import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { HowItWorksShowcase, type CardText, type Step } from "./HowItWorksShowcase";
import { SectionHeading } from "./SectionHeading";
import { StampsBackdrop } from "./StampsBackdrop";

/** The three steps beside a sample card that fills up as you move through them. */
export async function HowItWorks() {
  const t = await getTranslations("home.how");

  return (
    <section id="how" aria-labelledby="how-title" className="relative scroll-mt-20 overflow-hidden py-16 sm:py-24">
      <StampsBackdrop variant="how" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6">
        <SectionHeading id="how-title" eyebrow={t("eyebrow")} title={t("title")} />
        <div data-reveal style={{ "--reveal-delay": "120ms" } as CSSProperties}>
          <HowItWorksShowcase steps={t.raw("steps") as Step[]} card={t.raw("card") as CardText} />
        </div>
      </div>
    </section>
  );
}
