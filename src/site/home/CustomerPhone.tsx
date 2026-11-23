import {
  BatteryHigh,
  Bread,
  Cards,
  Coffee,
  MagnifyingGlass,
  QrCode,
  Scissors,
  User,
  WifiHigh,
  type Icon,
} from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";

export type PhoneCard = { name: string; filled: number; total: number };

/** Shop icon and tile color of each sample card, in order. */
const looks: { Shop: Icon; tone: string }[] = [
  { Shop: Coffee, tone: "bg-amber text-ink" },
  { Shop: Bread, tone: "bg-teal text-ink" },
  { Shop: Scissors, tone: "bg-neutral-0 text-brand-deep" },
];

/** The app's bottom tabs; the first one (cards) is the screen shown. */
const tabs: Icon[] = [Cards, QrCode, MagnifyingGlass, User];

/**
 * A phone showing the customer app's card list. Decorative: the shops and counts are samples,
 * and the feature list beside it already says the same thing to screen readers.
 */
export function CustomerPhone({ title, cards }: { title: string; cards: PhoneCard[] }) {
  return (
    <div aria-hidden className="mx-auto w-full max-w-64 -rotate-3">
      <div className="rounded-[2.5rem] border-8 border-neutral-800 bg-ink px-4 pt-3 pb-4 text-neutral-0 shadow-dialog">
        {/* Status bar */}
        <div className="flex items-center justify-between text-xs text-neutral-0/60" dir="ltr">
          <span className="tabular-nums">9:41</span>
          <span className="h-4 w-16 rounded-full bg-neutral-900" />
          <span className="flex items-center gap-1">
            <WifiHigh weight="bold" className="size-3.5" />
            <BatteryHigh weight="bold" className="size-4" />
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold">{title}</span>
          <span className="rounded-full bg-neutral-0/15 px-2.5 py-0.5 text-xs tabular-nums">{cards.length}</span>
        </div>

        <ul className="mt-3 flex flex-col gap-2">
          {cards.map((card, index) => {
            const look = looks[index % looks.length] ?? looks[0];
            const Shop = look?.Shop ?? Coffee;
            return (
              <li key={index} className="rounded-2xl bg-neutral-0/10 p-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", look?.tone)}>
                    <Shop weight="fill" className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">{card.name}</span>
                  <span className="text-sm font-bold text-amber tabular-nums" dir="ltr">
                    {card.filled}/{card.total}
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 rounded-full bg-neutral-0/15">
                  <div
                    className="h-full rounded-full bg-amber"
                    style={{ width: `${Math.round((card.filled / card.total) * 100)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        {/* Bottom tabs */}
        <div className="mt-4 flex justify-around border-t border-neutral-0/15 pt-3">
          {tabs.map((Tab, index) => (
            <Tab
              key={index}
              weight={index === 0 ? "fill" : "regular"}
              className={cn("size-5", index === 0 ? "text-amber" : "text-neutral-0/50")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
