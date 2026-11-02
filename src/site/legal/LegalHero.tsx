import type { ReactNode } from "react";

type LegalHeroProps = {
  eyebrow: string;
  title: string;
  lead: string;
  /** Version, last-updated date and similar facts under the lead. */
  meta?: ReactNode;
};

export function LegalHero({ eyebrow, title, lead, meta }: LegalHeroProps) {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-10 sm:px-6 sm:pt-16 sm:pb-12">
        <p className="text-sm font-bold text-brand">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black text-fg sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-fg-muted">{lead}</p>
        {meta && <div className="mt-6 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
    </div>
  );
}
