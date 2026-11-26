"use client";

import { Bread, Coffee, ForkKnife, Gift, Lightning, Scissors, type Icon } from "@phosphor-icons/react";
import { useState, type CSSProperties, type ReactNode } from "react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

/** One example card, with its text already translated on the server. */
export type ShowcaseCard = {
  key: string;
  label: string;
  shop: string;
  /** "Café · Damascus" */
  subtitle: string;
  /** The card's own name, e.g. "Coffee card" */
  name: string;
  total: number;
  filled: number;
  /** "of 10 stamps" */
  of: string;
  /** "7 more stamps to your reward" */
  pill: string;
  ariaLabel: string;
};

type HeroShowcaseProps = {
  cards: ShowcaseCard[];
  pickerLabel: string;
  giftLabel: string;
  /** Title and lead, rendered on the server. */
  intro: ReactNode;
  /** Buttons and store line, rendered on the server. */
  actions: ReactNode;
};

const icons: Record<string, Icon> = { cafe: Coffee, bakery: Bread, salon: Scissors, restaurant: ForkKnife };

/** Stamps per row, so 6, 8 and 10 stamps all fill even rows. */
const columns: Record<number, string> = { 6: "grid-cols-3", 8: "grid-cols-4", 10: "grid-cols-5" };

/** Sample day/month shown under the filled stamps, the way the app shows when each one was given. */
const stampDates = ["1/11", "2/11", "4/11", "5/11", "7/11", "7/11", "8/11", "9/11", "10/11"];

/** Hero layout with a shop-type picker that swaps the example stamp card. */
export function HeroShowcase({ cards, pickerLabel, giftLabel, intro, actions }: HeroShowcaseProps) {
  const [selected, setSelected] = useState(0);
  const card = cards[selected] ?? cards[0];
  if (!card) return null;
  const CardIcon = icons[card.key] ?? Coffee;

  return (
    <div className="relative mx-auto grid max-w-6xl items-center gap-20 px-4 pt-20 pb-24 sm:px-6 sm:pt-28 lg:grid-cols-[7fr_5fr] lg:gap-12 lg:pb-28">
      <div className="flex flex-col items-start">
        {intro}

        <div
          role="group"
          aria-label={pickerLabel}
          style={{ "--enter-delay": "300ms" } as CSSProperties}
          className="hero-enter mt-7 inline-flex max-w-full gap-1 rounded-full border border-border-strong bg-surface p-1">
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
                  "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition-colors sm:gap-2 sm:px-4 sm:text-base",
                  active ? "bg-brand text-brand-on" : "text-fg-muted hover:bg-neutral-50 hover:text-fg",
                  focusRing,
                )}
              >
                <ItemIcon aria-hidden weight={active ? "fill" : "regular"} className="size-5 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>

        {actions}
      </div>

      {/* The example card, the same design as the customer app, swaying in 3D above a soft floor shadow */}
      {/* The card comes in last, after the text */}
      <div
        className="hero-enter relative mx-auto w-full max-w-[21rem] [perspective:1200px]"
        style={{ "--enter-delay": "700ms" } as CSSProperties}
      >
        <div aria-hidden className="absolute -top-10 -end-8 size-44 rounded-full bg-amber/20 blur-2xl" />
        <div aria-hidden className="absolute -bottom-6 -start-10 size-52 rounded-full bg-teal/20 blur-2xl" />
        <div aria-hidden className="absolute inset-x-12 -bottom-12 h-6 hero-card-shadow rounded-[50%] bg-ink blur-xl" />

        {/* The sway lives on a wrapper, so the cards themselves can still play their enter animation when they change */}
        <div className="hero-card-sway">
          <div key={card.key} className="hero-card-swap flex flex-col gap-4">
            <div
              role="img"
              aria-label={card.ariaLabel}
              className="relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-brand p-5 text-neutral-0 shadow-dialog ring-1 ring-neutral-0/15 sm:p-6"
            >
              {/* Dotted pattern, as on the app's card */}
              <span aria-hidden className="hero-card-dots pointer-events-none absolute inset-0" />
              {/* Light sliding over the card as it turns */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 hero-card-shine bg-linear-to-br from-neutral-0/0 via-neutral-0/12 to-neutral-0/0 bg-size-[250%_250%]"
              />

              <div className="relative flex items-center gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-neutral-0">
                  <CardIcon weight="fill" className="size-7 text-amber-pressed" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-lg font-bold">{card.shop}</span>
                  <span className="text-sm text-neutral-0/80">{card.subtitle}</span>
                </div>
              </div>

              <div className="relative flex flex-col gap-2">
                <p className="text-base">{card.name}</p>
                <p className="flex items-baseline gap-3">
                  <span className="text-5xl leading-none font-black tabular-nums">{card.filled}</span>
                  <span className="text-base">{card.of}</span>
                </p>
              </div>

              <div className={cn("relative grid gap-x-3 gap-y-2", columns[card.total] ?? "grid-cols-5")}>
                {Array.from({ length: card.total }, (_, index) => {
                  // The last cell is the reward, the others are stamps.
                  const kind = index === card.total - 1 ? "gift" : index < card.filled ? "filled" : "empty";
                  return (
                    <div
                      key={index}
                      className="hero-stamp-pop flex flex-col items-center gap-1.5"
                      style={{ "--i": index } as CSSProperties}
                    >
                      <span
                        className={cn(
                          "grid aspect-square w-full place-items-center rounded-full",
                          kind === "filled" && "bg-neutral-0 text-brand",
                          kind === "empty" && "border border-dashed border-neutral-0/50",
                          kind === "gift" && "border-2 border-dashed border-amber text-amber",
                        )}
                      >
                        {kind === "filled" && <CardIcon weight="fill" className="size-[45%]" />}
                        {kind === "gift" && <Gift weight="fill" className="size-[45%]" />}
                      </span>
                      <span
                        className={cn(
                          "h-4 text-xs leading-4 tabular-nums",
                          kind === "gift" ? "font-medium text-amber" : "text-neutral-0/80",
                        )}
                      >
                        {kind === "filled" ? stampDates[index] : kind === "gift" ? giftLabel : ""}
                      </span>
                    </div>
                  );
                })}
              </div>

              <span className="relative inline-flex items-center gap-2 self-center rounded-full bg-amber px-4 py-1.5 text-sm font-bold text-ink">
                <Lightning aria-hidden weight="fill" className="size-4" />
                {card.pill}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
