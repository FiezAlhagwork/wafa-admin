import { CaretDown, ListBullets } from "@phosphor-icons/react/ssr";

export type TocItem = { id: string; number: number; title: string };

type LegalTocProps = {
  title: string;
  items: TocItem[];
};

function TocLinks({ items }: { items: TocItem[] }) {
  return (
    <ol className="flex flex-col gap-0.5">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="flex gap-3 rounded-lg px-3 py-2 text-sm text-fg-muted transition-colors outline-none hover:bg-neutral-100 hover:text-fg focus-visible:ring-2 focus-visible:ring-focus"
          >
            <span className="w-5 shrink-0 text-end text-fg-subtle tabular-nums">{item.number}</span>
            <span>{item.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Sticky list beside the text on large screens, a collapsible card above it on small ones. No JS. */
export function LegalToc({ title, items }: LegalTocProps) {
  return (
    <>
      <details className="group rounded-xl border border-border bg-surface lg:hidden print:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 font-bold text-fg outline-none focus-visible:ring-2 focus-visible:ring-focus [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <ListBullets aria-hidden className="size-5 text-brand" />
            {title}
          </span>
          <CaretDown aria-hidden className="size-4 text-fg-subtle transition-transform group-open:rotate-180" />
        </summary>
        <nav aria-label={title} className="border-t border-border p-2">
          <TocLinks items={items} />
        </nav>
      </details>

      <nav
        aria-label={title}
        className="sticky top-24 hidden max-h-[calc(100dvh-8rem)] overflow-y-auto lg:block print:hidden"
      >
        <p className="mb-2 px-3 text-xs font-bold text-fg-muted">{title}</p>
        <TocLinks items={items} />
      </nav>
    </>
  );
}
