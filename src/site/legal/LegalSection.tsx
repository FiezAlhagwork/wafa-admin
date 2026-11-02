import type { ReactNode } from "react";

type LegalSectionProps = {
  id: string;
  number?: number;
  title: string;
  children: ReactNode;
};

export function LegalSection({ id, number, title, children }: LegalSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 border-t border-border pt-10 first:border-0 first:pt-0"
    >
      <h2 id={`${id}-title`} className="flex items-center gap-3 text-2xl font-bold text-fg">
        {number !== undefined && (
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-base font-bold text-brand tabular-nums">
            {number}
          </span>
        )}
        {title}
      </h2>
      <div className="mt-5 flex flex-col gap-4 text-base leading-8 text-fg">{children}</div>
    </section>
  );
}

type LegalSubsectionProps = {
  title: string;
  children: ReactNode;
};

export function LegalSubsection({ title, children }: LegalSubsectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-bold text-fg">{title}</h3>
      {children}
    </div>
  );
}
