import { cn } from "@/lib/cn";

export type PhoneCard = { name: string; progress: string };

/** Tile colors of the sample cards on the phone, in order. */
const tones = ["bg-amber", "bg-teal", "bg-neutral-0"];

/**
 * A phone showing the customer app's card list. Decorative: the shops and counts are samples,
 * and the same text is not needed by screen readers next to the feature list.
 */
export function CustomerPhone({ title, cards }: { title: string; cards: PhoneCard[] }) {
  return (
    <div aria-hidden className="mx-auto w-full max-w-60 -rotate-3">
      <div className="rounded-[2.25rem] border-8 border-neutral-800 bg-brand-deep p-4 shadow-dialog">
        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-neutral-0/25" />
        <p className="text-sm text-neutral-0/75">{title}</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {cards.map((card, index) => (
            <li key={index} className="flex items-center gap-3 rounded-xl bg-neutral-0/10 p-2.5">
              <span className={cn("size-8 shrink-0 rounded-lg", tones[index % tones.length])} />
              <span className="min-w-0 flex-1 truncate text-sm font-bold">{card.name}</span>
              <span className="text-sm font-bold text-amber tabular-nums">{card.progress}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
