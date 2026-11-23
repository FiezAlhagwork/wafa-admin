import type { ReactNode } from "react";

/** Cards on small screens, the table from `lg` up: a list never scrolls sideways. */
export function ByWidth({ cards, table }: { cards: ReactNode; table: ReactNode }) {
  return (
    <>
      <div className="lg:hidden">{cards}</div>
      <div className="hidden lg:block">{table}</div>
    </>
  );
}
