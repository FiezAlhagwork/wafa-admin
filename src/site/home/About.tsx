import { ArrowRight, DeviceMobile, Notepad } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { SectionHeading } from "./SectionHeading";
import { StampsBackdrop } from "./StampsBackdrop";

/** Short "what is Wafa" section between the hero and the features: the paper stamp card, now on the phone. */
export async function About() {
  const t = await getTranslations("home.about");

  return (
    <section aria-labelledby="about-title" className="relative overflow-hidden py-16 sm:py-24">
      <StampsBackdrop variant="about" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[6fr_5fr] lg:gap-16">
        <SectionHeading
          id="about-title"
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead")}
          align="start"
          titleClassName="text-2xl sm:text-3xl"
          reveal="start"
        />

        {/* Paper card turning into the digital one */}
        <div data-reveal="end" style={{ "--reveal-delay": "150ms" } as CSSProperties} aria-hidden className="flex items-center justify-center gap-4 sm:gap-6">
          <div className="flex w-36 -rotate-3 flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border-strong bg-surface p-5 text-center sm:w-40">
            <Notepad weight="duotone" className="size-10 text-neutral-500" />
            <span className="font-bold text-fg">{t("paper.label")}</span>
            <span className="text-sm text-fg-muted">{t("paper.note")}</span>
          </div>
          <ArrowRight weight="bold" className="size-7 shrink-0 text-amber rtl:-scale-x-100" />
          <div className="flex w-36 rotate-3 flex-col items-center gap-2 rounded-2xl bg-brand p-5 text-center text-neutral-0 shadow-dialog sm:w-40">
            <DeviceMobile weight="duotone" className="size-10 text-amber" />
            <span className="font-bold">{t("digital.label")}</span>
            <span className="text-sm text-neutral-0/80">{t("digital.note")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
