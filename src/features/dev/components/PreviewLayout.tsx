import type { ReactNode } from "react";

export function PreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-border pb-2 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

export function PreviewRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="w-20 shrink-0 text-sm text-fg-muted">{label}</span>
      {children}
    </div>
  );
}
