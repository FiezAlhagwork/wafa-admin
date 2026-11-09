import { Coffee, QrCode } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";

const TOTAL = 10;
const FILLED = 7;

/** Illustration of a stamp card as it looks in the customer app. Decorative: one label describes it. */
export async function StampCardPreview() {
  const t = await getTranslations("home.hero.card");

  return (
    <div role="img" aria-label={t("label")} className="relative mx-auto w-full max-w-sm">
      {/* Soft brand shapes behind the card */}
      <div aria-hidden className="absolute -top-8 -end-6 size-40 rounded-full bg-amber/20" />
      <div aria-hidden className="absolute -bottom-10 -start-8 size-48 rounded-full bg-teal/20" />

      <div className="relative flex flex-col gap-6 rounded-3xl bg-ink p-6 text-neutral-0 shadow-dialog sm:p-7">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-neutral-0/10">
            <Coffee weight="fill" className="size-6 text-amber" />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-lg font-bold">{t("shop")}</span>
            <span className="text-sm text-neutral-0/80">{t("type")}</span>
          </div>
          <span className="ms-auto rounded-full bg-amber px-3 py-1 text-sm font-bold text-ink tabular-nums">
            {t("progress", { count: FILLED, total: TOTAL })}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: TOTAL }, (_, index) => {
            const filled = index < FILLED;
            return (
              <span
                key={index}
                className={cn(
                  "grid aspect-square place-items-center rounded-full",
                  filled ? "bg-amber text-ink" : "border-2 border-dashed border-neutral-0/30",
                )}
              >
                {filled && <Coffee weight="fill" className="size-5" />}
              </span>
            );
          })}
        </div>

        <p className="text-sm text-neutral-0/80">{t("remaining", { count: TOTAL - FILLED })}</p>
      </div>

      {/* The customer's code, the way stamps are added in the shop */}
      <div className="absolute -bottom-6 -start-4 flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 pe-4 shadow-popup sm:-start-8">
        <span className="grid size-11 place-items-center rounded-xl bg-neutral-0">
          <QrCode className="size-7 text-ink" />
        </span>
        <span className="text-sm font-medium text-fg">{t("scan")}</span>
      </div>
    </div>
  );
}
