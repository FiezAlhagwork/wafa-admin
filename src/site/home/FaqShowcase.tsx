"use client";

import { Check, Plus } from "@phosphor-icons/react";
import { useState, type CSSProperties, type ReactNode } from "react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

export type FaqGroup = { label: string; items: { question: string; answer: string }[] };

type FaqShowcaseProps = {
  /** Heading and contact button, shown above the group picker. */
  intro: ReactNode;
  groupsLabel: string;
  groups: FaqGroup[];
};

/**
 * The question groups (merchants, customers) as a picker beside the questions of the chosen one.
 * Every answer stays in the page (the other group is only hidden), so search engines read them all.
 */
export function FaqShowcase({ intro, groupsLabel, groups }: FaqShowcaseProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
      <div className="flex flex-col items-start">
        {intro}

        <div
          data-reveal="up"
          style={{ "--reveal-delay": "200ms" } as CSSProperties}
          role="group"
          aria-label={groupsLabel}
          className="mt-8 inline-flex max-w-full gap-1 rounded-full border border-border-strong bg-surface p-1"
        >
          {groups.map((group, index) => {
            const active = index === selected;
            return (
              <button
                key={index}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(index)}
                className={cn(
                  "h-10 rounded-full px-5 font-bold transition-colors",
                  active ? "bg-brand text-brand-on" : "text-fg-muted hover:bg-neutral-50 hover:text-fg",
                  focusRing,
                )}
              >
                {group.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {groups.map((group, index) => (
          <div key={index} hidden={index !== selected} className="flex flex-col gap-3">
            {group.items.map((item, itemIndex) => (
              <details
                key={itemIndex}
                data-reveal="end"
                style={{ "--reveal-delay": `${itemIndex * 80}ms` } as CSSProperties}
                className="group rounded-2xl border border-border bg-surface transition-colors open:border-brand"
              >
                <summary
                  className={cn(
                    "flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-lg font-bold text-fg [&::-webkit-details-marker]:hidden",
                    focusRing,
                  )}
                >
                  {item.question}
                  {/* A stamp: empty (dashed) while closed, stamped (filled) once open */}
                  <span
                    aria-hidden
                    className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-dashed border-amber text-amber transition-colors group-open:border-solid group-open:bg-amber group-open:text-ink"
                  >
                    <Plus weight="bold" className="size-4 group-open:hidden" />
                    <Check weight="bold" className="hidden size-4 group-open:block" />
                  </span>
                </summary>
                <p className="px-5 pb-5 leading-8 text-fg-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
