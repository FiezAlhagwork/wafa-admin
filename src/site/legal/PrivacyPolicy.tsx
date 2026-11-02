import type { ReactNode } from "react";
import {
  BellSlash,
  Check,
  Eye,
  EyeSlash,
  Info,
  LockKey,
  Prohibit,
  Trash,
  Warning,
  X,
} from "@phosphor-icons/react/ssr";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge, Card } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Callout } from "./Callout";
import { ContactCard } from "./ContactCard";
import { DataTable } from "./DataTable";
import { LegalHero } from "./LegalHero";
import { LegalSection, LegalSubsection } from "./LegalSection";
import { LegalToc } from "./LegalToc";
import { BulletList, type LabeledItem, LabeledList, StepList } from "./lists";
import { MissingValuesNotice } from "./MissingValuesNotice";
import { getPolicyValues } from "./policy-config";
import { textLink } from "./styles";

// Order here is the section numbering. `id` is the URL anchor, `key` the messages key.
const sections = [
  { id: "about", key: "about" },
  { id: "apps", key: "apps" },
  { id: "data", key: "data" },
  { id: "merchant-view", key: "merchantView" },
  { id: "notifications", key: "notifications" },
  { id: "pre-registration", key: "preRegistration" },
  { id: "use", key: "use" },
  { id: "sharing", key: "sharing" },
  { id: "retention", key: "retention" },
  { id: "delete", key: "delete" },
  { id: "permissions", key: "permissions" },
  { id: "security", key: "security" },
  { id: "age", key: "age" },
  { id: "changes", key: "changes" },
  { id: "contact", key: "contact" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

type DataRow = { data: string; purpose: string; retention: string };
type DataGroup = { title: string; rows: DataRow[] };
type ProviderRow = { provider: string; receives: string; why: string };
type PermissionItem = { label: string; who: string; text: string };

const summaryIcons = [Prohibit, LockKey, EyeSlash, BellSlash, Trash];

export async function PrivacyPolicy() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("privacy");
  const values = getPolicyValues(locale);

  const sectionProps = (key: SectionKey) => {
    const index = sections.findIndex((section) => section.key === key);
    return { id: sections[index].id, number: index + 1, title: t(`sections.${key}.title`) };
  };

  const strings = (key: string) => t.raw(key) as string[];
  const labeled = (key: string) => t.raw(key) as LabeledItem[];

  const tags = {
    b: (chunks: ReactNode) => <strong className="font-bold">{chunks}</strong>,
    contact: (chunks: ReactNode) => (
      <a href="#contact" className={textLink}>
        {chunks}
      </a>
    ),
    link: (chunks: ReactNode) => (
      <Link href="/delete-account" className={textLink}>
        {chunks}
      </Link>
    ),
    mail: (chunks: ReactNode) => (
      <a href={`mailto:${values.email}`} className={textLink}>
        {chunks}
      </a>
    ),
    wa: (chunks: ReactNode) => (
      <a href={`https://wa.me/${values.whatsapp}`} className={textLink} dir="ltr">
        {chunks}
      </a>
    ),
  };

  const dataGroups = t.raw("sections.data.groups") as DataGroup[];
  const providers: ProviderRow[] = [
    ...(t.raw("sections.sharing.providers") as ProviderRow[]),
    {
      provider: t("sections.sharing.hosting.provider", { provider: values.hostingProvider }),
      receives: t("sections.sharing.hosting.receives"),
      why: t("sections.sharing.hosting.why"),
    },
  ];

  return (
    <main id="content">
      <LegalHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        lead={t("lead")}
        meta={
          <>
            <Badge tone="brand">{t("version", { version: values.version })}</Badge>
            <Badge>{t("updated", { date: values.updatedAt })}</Badge>
            {t.has("referenceNote") && <p className="w-full pt-2 text-sm text-fg-muted">{t("referenceNote")}</p>}
          </>
        }
      />
      <MissingValuesNotice missing={values.missing} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <aside>
          <LegalToc title={t("toc.title")} items={sections.map(({ key }) => sectionProps(key))} />
        </aside>

        <div className="mt-8 flex max-w-3xl min-w-0 flex-col gap-12 lg:mt-0">
          <Card highlight className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-fg">{t("summary.title")}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {strings("summary.items").map((item, index) => {
                const Icon = summaryIcons[index] ?? Check;
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

          <div className="flex flex-col gap-10">
            <LegalSection {...sectionProps("about")}>
              <p>{t.rich("sections.about.p1", tags)}</p>
              <p>{t("sections.about.p2")}</p>
            </LegalSection>

            <LegalSection {...sectionProps("apps")}>
              <LabeledList items={labeled("sections.apps.items")} />
              <Callout tone="neutral" icon={<Info weight="fill" />}>
                <p>{t("sections.apps.payments")}</p>
              </Callout>
            </LegalSection>

            <LegalSection {...sectionProps("data")}>
              <p className="text-fg-muted">{t("sections.data.intro")}</p>
              {dataGroups.map((group) => (
                <LegalSubsection key={group.title} title={group.title}>
                  <DataTable
                    caption={group.title}
                    columns={[
                      { key: "data", label: t("sections.data.columns.data"), className: "w-[30%]" },
                      { key: "purpose", label: t("sections.data.columns.purpose") },
                      { key: "retention", label: t("sections.data.columns.retention"), className: "w-[28%]" },
                    ]}
                    rows={group.rows}
                  />
                </LegalSubsection>
              ))}
              <Callout tone="success" icon={<LockKey weight="fill" />}>
                <p>{t("sections.data.notCollected")}</p>
              </Callout>
            </LegalSection>

            <LegalSection {...sectionProps("merchantView")}>
              <p>{t("sections.merchantView.intro")}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <VisibilityCard
                  tone="sees"
                  title={t("sections.merchantView.sees.title")}
                  items={strings("sections.merchantView.sees.items")}
                />
                <VisibilityCard
                  tone="hidden"
                  title={t("sections.merchantView.notSees.title")}
                  items={strings("sections.merchantView.notSees.items")}
                />
              </div>
              <p className="text-fg-muted">{t("sections.merchantView.note")}</p>
            </LegalSection>

            <LegalSection {...sectionProps("notifications")}>
              <p>{t("sections.notifications.intro")}</p>
              <LabeledList items={labeled("sections.notifications.items")} />
              <p>{t("sections.notifications.p1")}</p>
              <p>{t("sections.notifications.p2")}</p>
            </LegalSection>

            <LegalSection {...sectionProps("preRegistration")}>
              <p>{t("sections.preRegistration.p1")}</p>
              <p>{t.rich("sections.preRegistration.p2", tags)}</p>
            </LegalSection>

            <LegalSection {...sectionProps("use")}>
              <BulletList items={strings("sections.use.items")} />
              <Callout tone="success" icon={<Prohibit weight="bold" />}>
                <p className="font-medium">{t("sections.use.never")}</p>
              </Callout>
            </LegalSection>

            <LegalSection {...sectionProps("sharing")}>
              <p>{t.rich("sections.sharing.merchants", tags)}</p>
              <p>{t.rich("sections.sharing.publicShop", tags)}</p>
              <p>{t.rich("sections.sharing.providersIntro", tags)}</p>
              <DataTable
                caption={t("sections.sharing.title")}
                columns={[
                  { key: "provider", label: t("sections.sharing.columns.provider"), className: "w-[30%]" },
                  { key: "receives", label: t("sections.sharing.columns.receives") },
                  { key: "why", label: t("sections.sharing.columns.why"), className: "w-[30%]" },
                ]}
                rows={providers}
              />
              <p>{t("sections.sharing.contracts")}</p>
              <p className="text-fg-muted">{t("sections.sharing.legal")}</p>
            </LegalSection>

            <LegalSection {...sectionProps("retention")}>
              <p>{t("sections.retention.p1", { backup: values.backupRetention })}</p>
            </LegalSection>

            <LegalSection {...sectionProps("delete")}>
              <LegalSubsection title={t("sections.delete.customer.title")}>
                <p>{t("sections.delete.customer.intro")}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="p-5">
                    <h4 className="mb-4 font-bold text-fg">{t("sections.delete.customer.inApp.title")}</h4>
                    <StepList steps={strings("sections.delete.customer.inApp.steps")} />
                  </Card>
                  <Card className="p-5">
                    <h4 className="mb-3 font-bold text-fg">{t("sections.delete.customer.outside.title")}</h4>
                    <p className="leading-7">
                      {t.rich("sections.delete.customer.outside.text", {
                        ...tags,
                        email: values.email,
                        phone: values.phone,
                      })}
                    </p>
                  </Card>
                </div>
                <p>{t.rich("sections.delete.customer.whatHappens", tags)}</p>
                <Callout tone="warning" icon={<Warning weight="fill" />}>
                  <p className="font-medium">{t("sections.delete.customer.warning")}</p>
                </Callout>
              </LegalSubsection>

              <LegalSubsection title={t("sections.delete.merchant.title")}>
                <p>{t.rich("sections.delete.merchant.intro", tags)}</p>
                <LabeledList items={labeled("sections.delete.merchant.items")} />
              </LegalSubsection>
            </LegalSection>

            <LegalSection {...sectionProps("permissions")}>
              <ul className="grid gap-3 sm:grid-cols-3">
                {(t.raw("sections.permissions.items") as PermissionItem[]).map((item) => (
                  <li key={item.label} className="rounded-xl border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-fg">{item.label}</span>
                      <Badge>{item.who}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-fg-muted">{item.text}</p>
                  </li>
                ))}
              </ul>
              <p>{t("sections.permissions.p1")}</p>
              <p>{t("sections.permissions.p2")}</p>
            </LegalSection>

            <LegalSection {...sectionProps("security")}>
              <p>{t("sections.security.p1")}</p>
              <p>
                {t("sections.security.p2", { provider: values.hostingProvider, region: values.hostingRegion })}
              </p>
            </LegalSection>

            <LegalSection {...sectionProps("age")}>
              <p>{t("sections.age.p1")}</p>
            </LegalSection>

            <LegalSection {...sectionProps("changes")}>
              <p>{t("sections.changes.p1")}</p>
            </LegalSection>

            <LegalSection {...sectionProps("contact")}>
              <p>{t("sections.contact.intro")}</p>
              <ContactCard
                values={values}
                labels={{
                  email: t("sections.contact.email"),
                  phone: t("sections.contact.phone"),
                  party: t("sections.contact.party"),
                }}
                partyValue={t("sections.contact.partyValue")}
              />
            </LegalSection>
          </div>
        </div>
      </div>
    </main>
  );
}

function VisibilityCard({ tone, title, items }: { tone: "sees" | "hidden"; title: string; items: string[] }) {
  const sees = tone === "sees";
  const ItemIcon = sees ? Check : X;
  const TitleIcon = sees ? Eye : EyeSlash;

  return (
    <div className={sees ? "rounded-xl bg-success-soft p-5" : "rounded-xl bg-neutral-100 p-5"}>
      <h3 className="flex items-center gap-2 font-bold text-fg">
        <TitleIcon aria-hidden weight="bold" className={sees ? "size-5 text-success" : "size-5 text-fg-muted"} />
        {title}
      </h3>
      <ul className="mt-3 flex flex-col gap-2.5 text-sm leading-6 text-fg">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <ItemIcon
              aria-hidden
              weight="bold"
              className={sees ? "mt-1 size-4 shrink-0 text-success" : "mt-1 size-4 shrink-0 text-fg-muted"}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
