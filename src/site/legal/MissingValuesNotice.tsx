import { Warning } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { Callout } from "./Callout";

/** Dev only: lists the empty fields in policy-config.ts. A production build fails instead. */
export async function MissingValuesNotice({ missing }: { missing: string[] }) {
  if (missing.length === 0) return null;
  const t = await getTranslations("site.missingValues");

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 print:hidden">
      <Callout tone="warning" icon={<Warning weight="fill" />} title={t("title")}>
        <p className="text-sm">{t("message", { fields: missing.join(", ") })}</p>
      </Callout>
    </div>
  );
}
