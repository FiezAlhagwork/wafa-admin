import { Fragment, type ReactNode } from "react";
import { Coins, Gift, IdentificationCard, Info, Storefront, Trash, Warning } from "@phosphor-icons/react/ssr";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge, Card } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Callout } from "./Callout";
import { ContactCard } from "./ContactCard";
import { LegalHero } from "./LegalHero";
import { LegalSection } from "./LegalSection";
import { LegalToc } from "./LegalToc";
import { BulletList } from "./lists";
import { MissingValuesNotice } from "./MissingValuesNotice";
import { getPolicyValues } from "./policy-config";
import { textLink } from "./styles";

// The terms are a list of sections made of simple blocks (messages `terms.sections`),
// so the text can change without touching this component.
type ListItem = string | { text: string; items: string[] };
type Block = { p: string } | { h3: string } | { list: ListItem[] } | { warning: string };
type Section = { id: string; title: string; blocks: Block[] };

const summaryIcons = [Gift, IdentificationCard, Storefront, Coins, Trash];

export async function TermsOfUse() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("terms");
  const values = getPolicyValues(locale);
  const sections = t.raw("sections") as Section[];

  const tags = {
    b: (chunks: ReactNode) => <strong className="font-bold">{chunks}</strong>,
    privacy: (chunks: ReactNode) => (
      <Link href="/privacy" className={textLink}>
        {chunks}
      </Link>
    ),
    delete: (chunks: ReactNode) => (
      <Link href="/delete-account" className={textLink}>
        {chunks}
      </Link>
    ),
  };
  // Text is read by its path so <b> and links are rendered (t.raw returns plain strings).
  const rich = (path: string) => t.rich(path, tags);

  const renderBlock = (block: Block, path: string) => {
    if ("p" in block) return <p>{rich(`${path}.p`)}</p>;
    if ("h3" in block) return <h3 className="pt-2 text-lg font-bold text-fg">{block.h3}</h3>;
    if ("warning" in block) {
      return (
        <Callout tone="warning" icon={<Warning weight="fill" />}>
          <p>{rich(`${path}.warning`)}</p>
        </Callout>
      );
    }
    return (
      <BulletList
        items={block.list.map((item, index) =>
          typeof item === "string" ? (
            rich(`${path}.list.${index}`)
          ) : (
            <>
              {rich(`${path}.list.${index}.text`)}
              <BulletList className="mt-2" items={item.items.map((_, sub) => rich(`${path}.list.${index}.items.${sub}`))} />
            </>
          ),
        )}
      />
    );
  };

  return (
    <main id="content">
      <LegalHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        lead={t("lead")}
        meta={
          <>
            <Badge tone="brand">{t("version", { version: values.termsVersion })}</Badge>
            <Badge>{t("updated", { date: values.termsEffectiveAt })}</Badge>
            {t.has("referenceNote") && <p className="w-full pt-2 text-sm text-fg-muted">{t("referenceNote")}</p>}
          </>
        }
      />
      <MissingValuesNotice missing={values.missing} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <aside>
          <LegalToc
            title={t("toc.title")}
            items={sections.map((section, index) => ({ id: section.id, number: index + 1, title: section.title }))}
          />
        </aside>

        <div className="mt-8 flex max-w-3xl min-w-0 flex-col gap-12 lg:mt-0">
          <div className="flex flex-col gap-4">
            <Callout tone="brand" icon={<Info weight="fill" />}>
              <p>{t("scope")}</p>
            </Callout>
            <Card highlight className="p-5 sm:p-6">
              <h2 className="text-lg font-bold text-fg">{t("summary.title")}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {(t.raw("summary.items") as string[]).map((item, index) => {
                  const Icon = summaryIcons[index] ?? Info;
                  return (
                    <li key={index} className="flex items-start gap-3 text-sm leading-6 text-fg">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                        <Icon aria-hidden className="size-4.5" />
                      </span>
                      <span className="pt-1">{item}</span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>

          <div className="flex flex-col gap-10">
            {sections.map((section, sectionIndex) => (
              <LegalSection key={section.id} id={section.id} number={sectionIndex + 1} title={section.title}>
                {section.blocks.map((block, blockIndex) => (
                  <Fragment key={blockIndex}>
                    {renderBlock(block, `sections.${sectionIndex}.blocks.${blockIndex}`)}
                  </Fragment>
                ))}
                {section.id === "contact" && (
                  <ContactCard
                    values={{ ...values, email: values.supportEmail }}
                    labels={{ email: t("contact.email"), phone: t("contact.phone"), party: t("contact.party") }}
                    partyValue={t("contact.partyValue")}
                  />
                )}
              </LegalSection>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
