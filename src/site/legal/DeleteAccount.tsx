import type { ReactNode } from "react";
import { ArrowUpRight, Check, DeviceMobile, Envelope, Storefront, Warning, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge, Card } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Callout } from "./Callout";
import { LegalHero } from "./LegalHero";
import { BulletList, StepList } from "./lists";
import { MissingValuesNotice } from "./MissingValuesNotice";
import { getPolicyValues } from "./policy-config";
import { textLink } from "./styles";

export async function DeleteAccount() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("deleteAccount");
  const values = getPolicyValues(locale);

  const mailto = `mailto:${values.email}?subject=${encodeURIComponent(t("outside.emailSubject"))}`;
  const tags = {
    mail: (chunks: ReactNode) => (
      <a href={mailto} className={textLink}>
        {chunks}
      </a>
    ),
    wa: (chunks: ReactNode) => (
      <a href={`https://wa.me/${values.whatsapp}`} className={textLink} dir="ltr">
        {chunks}
      </a>
    ),
    link: (chunks: ReactNode) => (
      <Link href="/privacy#delete" className={textLink}>
        {chunks}
      </Link>
    ),
  };

  return (
    <main id="content">
      <LegalHero eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <MissingValuesNotice missing={values.missing} />

      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
        <Callout tone="warning" icon={<Warning weight="fill" />} title={t("warning.title")}>
          <p>{t("warning.text")}</p>
        </Callout>

        <div className="grid gap-4 md:grid-cols-2">
          <Card highlight className="flex flex-col gap-5 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-fg">
                <DeviceMobile aria-hidden className="size-5 text-brand" />
                {t("inApp.title")}
              </h2>
              <Badge tone="amber">{t("inApp.badge")}</Badge>
            </div>
            <StepList steps={t.raw("inApp.steps") as string[]} />
            <p className="mt-auto text-sm text-fg-muted">{t("inApp.note")}</p>
          </Card>

          <Card className="flex flex-col gap-4 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-fg">{t("outside.title")}</h2>
            <p className="text-sm leading-6 text-fg-muted">{t("outside.intro")}</p>
            <ContactOption icon={<Envelope />} label={t("outside.emailLabel")}>
              {t.rich("outside.emailText", { ...tags, email: values.email })}
            </ContactOption>
            <ContactOption icon={<WhatsappLogo />} label={t("outside.whatsappLabel")}>
              {t.rich("outside.whatsappText", { ...tags, phone: values.phone })}
            </ContactOption>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-fg">{t("deleted.title")}</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm leading-6 text-fg">
              {(t.raw("deleted.items") as string[]).map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Check aria-hidden weight="bold" className="mt-1 size-4 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-fg">{t("kept.title")}</h2>
            <BulletList
              className="mt-3 text-sm leading-6"
              items={[t("kept.anonymized"), t("kept.backups", { backup: values.backupRetention })]}
            />
          </Card>
        </div>

        <Callout tone="neutral" icon={<Storefront weight="fill" />} title={t("merchant.title")}>
          <p>{t.rich("merchant.text", tags)}</p>
        </Callout>

        <Link
          href="/privacy"
          className="inline-flex items-center gap-1.5 self-start rounded-sm font-medium text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
        >
          {t("policyLink")}
          <ArrowUpRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Link>
      </div>
    </main>
  );
}

function ContactOption({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl bg-neutral-50 p-4">
      <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand [&>svg]:size-5">
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-bold text-fg">{label}</span>
        <p className="text-sm leading-6 wrap-break-word text-fg">{children}</p>
      </div>
    </div>
  );
}
