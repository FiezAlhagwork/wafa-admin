"use client";

import { Cake, ChartLineUp, Megaphone, Palette, QrCode, Storefront, type Icon } from "@phosphor-icons/react";
import { useState } from "react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

type Item = { title: string; text: string };

/** One icon per item, in the same order as home.features.merchants.items. */
const icons: Icon[] = [Palette, QrCode, Megaphone, Cake, ChartLineUp, Storefront];

/** The merchant features as a list; the one you point at or pick is explained in the panel beside it. */
export function MerchantFeatures({ items }: { items: Item[] }) {
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
                  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-start font-bold transition-colors",
                  active
                    ? "border-brand bg-brand-soft text-fg"
                    : "border-border-strong bg-surface text-fg hover:border-neutral-400",
                  focusRing,
                )}
              >
                <ItemIcon aria-hidden weight={active ? "fill" : "regular"} className="size-6 shrink-0 text-brand" />
                {item.title}
              </button>
            </li>
          );
        })}
      </ul>

      <div
        aria-live="polite"
        className="flex min-h-64 flex-col justify-center gap-4 rounded-3xl bg-brand-deep p-7 text-neutral-0 sm:p-9"
      >
        <div key={selected} className="flex animate-enter flex-col gap-4">
          <span className="grid size-14 place-items-center rounded-full bg-amber text-ink">
            <CurrentIcon aria-hidden weight="fill" className="size-7" />
          </span>
          <h4 className="text-2xl font-bold">{current.title}</h4>
          <p className="text-lg leading-8 text-neutral-0/80">{current.text}</p>
        </div>
        {/* Decorative stamps, as on the card */}
        <div aria-hidden className="mt-2 flex gap-2">
          {[0, 1, 2, 3, 4].map((stamp) => (
            <span
              key={stamp}
              className={cn(
                "size-6 rounded-full",
                stamp < 3 ? "bg-amber" : "border border-dashed border-neutral-0/50",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
