import { WhatsappLogo } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { policy } from "@/site/legal/policy-config";
import { FaqShowcase, type FaqGroup } from "./FaqShowcase";
import { SectionHeading } from "./SectionHeading";
import { StampsBackdrop } from "./StampsBackdrop";
import { ctaButton } from "./styles";

/** Questions for merchants and for customers, with a WhatsApp link for anything they don't answer. */
export async function Faq() {
  const t = await getTranslations("home.faq");
  // The same contact number as the privacy policy, in the digits-only form wa.me expects
  const whatsapp = policy.phone.replace(/[^\d]/g, "");

  return (
    <section id="faq" aria-labelledby="faq-title" className="relative scroll-mt-20 overflow-hidden py-16 sm:py-24">
      <StampsBackdrop variant="faq" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <FaqShowcase
          groupsLabel={t("groupsLabel")}
          groups={[t.raw("merchants") as FaqGroup, t.raw("customers") as FaqGroup]}
          intro={
            <>
              <SectionHeading id="faq-title" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} align="start" />
              {whatsapp && (
                // The reveal sits on a wrapper: on the link itself it would override the button's own press effect
                <div data-reveal style={{ "--reveal-delay": "120ms" } as CSSProperties} className="mt-6">
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={ctaButton("accent", "h-12 px-6 text-base")}
                  >
                    <WhatsappLogo aria-hidden weight="fill" />
                    {t("whatsapp")}
                  </a>
                </div>
              )}
            </>
          }
        />
      </div>
    </section>
  );
}
