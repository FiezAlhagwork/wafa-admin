"use client";

import { Bread, Coffee, ForkKnife, QrCode, Scissors, type Icon } from "@phosphor-icons/react";
import { useState, type ReactNode } from "react";
import { focusRingOnInk } from "@/site/layout/styles";
import { cn } from "@/lib/cn";

/** One example card, with its text already translated on the server. */
export type ShowcaseCard = {
  key: string;
  label: string;
  shop: string;
  type: string;
  total: number;
  filled: number;
  progress: string;
  remaining: string;
  ariaLabel: string;
};

type HeroShowcaseProps = {
  cards: ShowcaseCard[];
  pickerLabel: string;
  scanLabel: string;
  /** Title and lead, rendered on the server. */
  intro: ReactNode;
  /** Buttons and store line, rendered on the server. */
  actions: ReactNode;
};

const icons: Record<string, Icon> = { cafe: Coffee, bakery: Bread, salon: Scissors, restaurant: ForkKnife };

/** Stamps per row, so 6, 8 and 10 stamps all fill even rows. */
const columns: Record<number, string> = { 6: "grid-cols-3", 8: "grid-cols-4", 10: "grid-cols-5" };

/** Hero layout with a shop-type picker that swaps the example stamp card. */
export function HeroShowcase({ cards, pickerLabel, scanLabel, intro, actions }: HeroShowcaseProps) {
  const [selected, setSelected] = useState(0);
  const card = cards[selected] ?? cards[0];
  if (!card) return null;
  const CardIcon = icons[card.key] ?? Coffee;

  return (
    <div className="mx-auto grid max-w-6xl items-center gap-20 px-4 pt-12 pb-24 sm:px-6 sm:pt-16 lg:grid-cols-[7fr_5fr] lg:gap-12 lg:pb-28">
      <div className="flex flex-col items-start">
        {intro}

        <div role="group" aria-label={pickerLabel} className="mt-7 flex flex-wrap gap-2">
          {cards.map((item, index) => {
            const ItemIcon = icons[item.key] ?? Coffee;
            const active = index === selected;
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(index)}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-xl border px-4 font-bold transition-colors",
                  active
                    ? "border-amber bg-amber text-ink"
                    : "border-neutral-0/20 bg-neutral-0/5 text-neutral-0 hover:border-neutral-0/40 hover:bg-neutral-0/10",
                  focusRingOnInk,
                )}
              >
                <ItemIcon aria-hidden weight={active ? "fill" : "regular"} className="size-5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {actions}
      </div>

      {/* The example card, swaying in 3D above a soft floor shadow */}
      <div className="relative mx-auto w-full max-w-sm [perspective:1200px]">
        <div aria-hidden className="absolute -top-10 -end-8 size-44 rounded-full bg-amber/20 blur-2xl" />
        <div aria-hidden className="absolute -bottom-6 -start-10 size-52 rounded-full bg-teal/20 blur-2xl" />
        <div aria-hidden className="absolute inset-x-12 -bottom-12 h-6 hero-card-shadow rounded-[50%] bg-ink blur-xl" />

        {/* The sway lives on a wrapper, so the card itself can still play its enter animation when it changes */}
        <div className="hero-card-sway">
          <div
            key={card.key}
            role="img"
            aria-label={card.ariaLabel}
            className="relative flex animate-enter flex-col gap-6 overflow-hidden rounded-3xl bg-ink p-6 text-neutral-0 shadow-dialog sm:p-7"
          >
            {/* Light sliding over the card as it turns */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 hero-card-shine bg-linear-to-br from-neutral-0/0 via-neutral-0/12 to-neutral-0/0 bg-size-[250%_250%]"
            />
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-neutral-0/10">
                <CardIcon weight="fill" className="size-6 text-amber" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-lg font-bold">{card.shop}</span>
                <span className="text-sm text-neutral-0/80">{card.type}</span>
              </div>
              <span className="ms-auto shrink-0 rounded-full bg-amber px-3 py-1 text-sm font-bold text-ink tabular-nums">
                {card.progress}
              </span>
            </div>

            <div className={cn("grid gap-3", columns[card.total] ?? "grid-cols-5")}>
              {Array.from({ length: card.total }, (_, index) => {
                const filled = index < card.filled;
                return (
                  <span
                    key={index}
                    className={cn(
                      "grid aspect-square place-items-center rounded-full",
                      filled ? "bg-amber text-ink" : "border-2 border-dashed border-neutral-0/30",
                    )}
                  >
                    {filled && <CardIcon weight="fill" className="size-5" />}
                  </span>
                );
              })}
            </div>

            <div className="flex items-end justify-between gap-4 border-t border-neutral-0/10 pt-5">
              <p className="text-sm leading-6 text-neutral-0/80">{card.remaining}</p>
              <div className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl bg-neutral-0 p-2.5 text-ink">
                <QrCode className="size-14" />
                <span className="text-[11px] font-medium">{scanLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
