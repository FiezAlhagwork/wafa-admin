"use client";

import { Coffee, Gift } from "@phosphor-icons/react";
import { useState } from "react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

export type Step = { title: string; text: string };
export type CardText = { shop: string; of: string; status: string[] };

/** Stamps on the sample card at each step: empty, partly filled, full. */
const filledAt = [0, 3, 5];
/** Stamps the sample card needs before its reward. */
const total = 5;

/** The steps as a list; the one you point at or pick shows its moment on the sample card beside it. */
export function HowItWorksShowcase({ steps, card }: { steps: Step[]; card: CardText }) {
  const [selected, setSelected] = useState(0);
  const filled = filledAt[selected] ?? 0;
  const done = filled >= total;

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <ol className="flex flex-col gap-3">
        {steps.map((step, index) => {
          const active = index === selected;
          return (
            <li key={index}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(index)}
                onMouseEnter={() => setSelected(index)}
                className={cn(
                  "flex w-full items-start gap-4 rounded-2xl border p-5 text-start transition-colors",
                  active ? "border-border bg-surface shadow-card" : "border-transparent hover:bg-surface/60",
                  focusRing,
                )}
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full text-lg font-bold tabular-nums transition-colors",
                    active ? "bg-amber text-ink" : "bg-neutral-100 text-fg",
                  )}
                >
                  {index + 1}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-xl font-bold text-fg">{step.title}</span>
                  <span className="leading-7 text-fg-muted">{step.text}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* The sample card at the chosen step */}
      <div aria-hidden className="mx-auto w-full max-w-64 -rotate-3">
        <div className="flex flex-col gap-4 rounded-3xl bg-brand-deep p-5 text-neutral-0 shadow-dialog">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-neutral-0">
              <Coffee weight="fill" className="size-5 text-amber-pressed" />
            </span>
            <span className="font-bold">{card.shop}</span>
          </div>

          <p className="flex items-baseline gap-2">
            <span className="text-4xl leading-none font-black tabular-nums">{filled}</span>
            <span>{card.of}</span>
          </p>

          <div className="grid grid-cols-3 justify-items-center gap-2.5">
            {Array.from({ length: total + 1 }, (_, index) => {
              const gift = index === total;
              const stamped = !gift && index < filled;
              return (
                <span
                  key={index}
                  className={cn(
                    "grid size-14 place-items-center rounded-full transition-colors duration-300",
                    gift
                      ? done
                        ? "bg-amber text-ink"
                        : "border-2 border-dashed border-amber text-amber"
                      : stamped
                        ? "bg-neutral-0 text-brand-deep"
                        : "border-2 border-dashed border-neutral-0/40",
                  )}
                >
                  {gift ? (
                    <Gift weight="fill" className="size-5" />
                  ) : (
                    stamped && <Coffee weight="fill" className="size-5" />
                  )}
                </span>
              );
            })}
          </div>

          <p key={selected} className="animate-enter rounded-full bg-amber px-4 py-2 text-center text-sm font-bold text-ink">
            {card.status[selected]}
          </p>
        </div>
      </div>
    </div>
  );
}
