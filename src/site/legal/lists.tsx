import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function BulletList({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span aria-hidden className="mt-3.5 size-1.5 shrink-0 rounded-full bg-brand" />
          <div className="min-w-0">{item}</div>
        </li>
      ))}
    </ul>
  );
}

export type LabeledItem = { label: string; text: string };

/** Bold label followed by its text, one per line. */
export function LabeledList({ items }: { items: LabeledItem[] }) {
  return (
    <BulletList
      items={items.map((item) => (
        <>
          <strong className="font-bold">{item.label}:</strong> {item.text}
        </>
      ))}
    />
  );
}

/** Numbered steps, e.g. the in-app path to delete an account. */
export function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-brand-on tabular-nums">
            {index + 1}
          </span>
          <span className="pt-0.5 leading-7">{step}</span>
        </li>
      ))}
    </ol>
  );
}
