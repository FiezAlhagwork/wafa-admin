"use client";

import {
  Cake,
  CaretRight,
  ChartLineUp,
  Check,
  Coffee,
  ForkKnife,
  Megaphone,
  Palette,
  QrCode,
  Scissors,
  Storefront,
  type Icon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

type Item = { title: string; text: string };

/** Sample text inside the illustrations under each feature. */
export type VisualText = {
  stamp: string;
  campaignLabel: string;
  campaignText: string;
  birthdayMonth: string;
  birthdayDay: string;
  birthdayBadge: string;
  statsStamps: string;
  statsStampsLabel: string;
  statsRewards: string;
  statsRewardsLabel: string;
  shopName: string;
  shopMeta: string;
};

/** One icon per item, in the same order as home.features.merchants.items. */
const icons: Icon[] = [Palette, QrCode, Megaphone, Cake, ChartLineUp, Storefront];

/** Shop icons and card colors a merchant can pick, for the first illustration. */
const cardChoices: { Shop: Icon; tone: string }[] = [
  { Shop: Coffee, tone: "bg-amber text-ink" },
  { Shop: Cake, tone: "bg-teal text-ink" },
  { Shop: Scissors, tone: "bg-info text-neutral-0" },
  { Shop: ForkKnife, tone: "bg-neutral-0 text-brand" },
];

/** Bar heights of the sample chart in the stats illustration. */
const bars = ["h-4", "h-7", "h-3", "h-10", "h-6", "h-12"];

/**
 * The small illustration under each feature, one per item, so every card shows its own thing.
 * Decorative only: the names and numbers in it are samples, not live data.
 */
function FeatureVisual({ index, text }: { index: number; text: VisualText }) {
  if (index === 0) {
    return (
      <div aria-hidden className="flex items-center gap-4">
        {cardChoices.map(({ Shop, tone }, choice) => (
          <span
            key={choice}
            className={cn(
              "grid size-12 place-items-center rounded-xl",
              tone,
              choice === 0 && "outline-2 outline-offset-2 outline-neutral-0",
            )}
          >
            <Shop weight="fill" className="size-6" />
          </span>
        ))}
      </div>
    );
  }

  if (index === 1) {
    return (
      <div aria-hidden className="flex items-center gap-3">
        <QrCode weight="duotone" className="size-9" />
        <CaretRight weight="bold" className="size-4 text-amber rtl:-scale-x-100" />
        <span className="inline-flex items-center gap-2 rounded-full bg-neutral-0/15 px-4 py-2">
          <Check weight="bold" className="size-4 text-amber" />
          {text.stamp}
        </span>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div aria-hidden className="max-w-sm rounded-2xl rounded-ss-sm bg-neutral-0/15 px-4 py-3">
        <p className="text-sm text-neutral-0/70">{text.campaignLabel}</p>
        <p className="mt-1">{text.campaignText}</p>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div aria-hidden className="flex flex-wrap items-center gap-3">
        <span className="min-w-16 rounded-xl bg-neutral-0 px-3 py-2 text-center text-ink">
          <span className="block text-xs">{text.birthdayMonth}</span>
          <span className="block text-xl leading-tight font-bold">{text.birthdayDay}</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-amber px-4 py-2 font-bold text-ink">
          <Cake weight="fill" className="size-5" />
          {text.birthdayBadge}
        </span>
      </div>
    );
  }

  if (index === 4) {
    return (
      <div aria-hidden className="flex flex-wrap items-end gap-6">
        <span className="flex h-12 items-end gap-1.5">
          {bars.map((height, bar) => (
            <span key={bar} className={cn("w-3 rounded-t-sm bg-amber", height)} />
          ))}
        </span>
        <span className="flex gap-6">
          <span className="block">
            <span className="block text-2xl leading-none font-black tabular-nums">{text.statsStamps}</span>
            <span className="block text-sm text-neutral-0/70">{text.statsStampsLabel}</span>
          </span>
          <span className="block">
            <span className="block text-2xl leading-none font-black tabular-nums">{text.statsRewards}</span>
            <span className="block text-sm text-neutral-0/70">{text.statsRewardsLabel}</span>
          </span>
        </span>
      </div>
    );
  }

  return (
    <div aria-hidden className="flex max-w-sm items-center gap-3 rounded-2xl bg-neutral-0/12 px-3 py-2.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber text-ink">
        <Coffee weight="fill" className="size-5" />
      </span>
      <span className="block min-w-0">
        <span className="block truncate font-bold">{text.shopName}</span>
        <span className="block truncate text-sm text-neutral-0/70">{text.shopMeta}</span>
      </span>
      <CaretRight weight="bold" className="ms-auto size-4 shrink-0 text-neutral-0/60 rtl:-scale-x-100" />
    </div>
  );
}

/** The merchant features as a list; the one you point at or pick is explained in the panel beside it. */
export function MerchantFeatures({ items, visuals }: { items: Item[]; visuals: VisualText }) {
  const [selected, setSelected] = useState(0);
  const current = items[selected] ?? items[0];
  if (!current) return null;
  const CurrentIcon = icons[selected] ?? Palette;

  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_1.15fr] lg:gap-6">
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {items.map((item, index) => {
          const ItemIcon = icons[index] ?? Palette;
          const active = index === selected;
          return (
            <li key={index}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(index)}
                onMouseEnter={() => setSelected(index)}
                className={cn(
                  "relative flex w-full items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 text-start font-bold transition-colors",
                  active
                    ? "border-brand bg-brand-soft text-fg"
                    : "border-border-strong bg-surface text-fg hover:border-neutral-400",
                  focusRing,
                )}
              >
                {active && <span aria-hidden className="absolute inset-y-0 start-0 w-1 bg-amber" />}
                <ItemIcon aria-hidden weight={active ? "fill" : "regular"} className="size-6 shrink-0 text-brand" />
                {item.title}
                <CaretRight
                  aria-hidden
                  weight="bold"
                  className="ms-auto size-4 shrink-0 text-fg-subtle rtl:-scale-x-100"
                />
              </button>
            </li>
          );
        })}
      </ul>

      <div
        aria-live="polite"
        className="flex min-h-72 flex-col gap-4 rounded-3xl bg-brand p-7 text-neutral-0 sm:p-9"
      >
        <div key={selected} className="flex animate-enter flex-col gap-4">
          <span className="grid size-14 place-items-center rounded-full bg-amber text-ink">
            <CurrentIcon aria-hidden weight="fill" className="size-7" />
          </span>
          <h4 className="text-2xl font-bold">{current.title}</h4>
          <p className="text-lg leading-8 text-neutral-0/80">{current.text}</p>
        </div>

        <div key={`visual-${selected}`} className="mt-auto animate-enter border-t border-neutral-0/15 pt-6">
          <FeatureVisual index={selected} text={visuals} />
        </div>
      </div>
    </div>
  );
}
