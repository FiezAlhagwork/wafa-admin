"use client";

import { List, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { NavLinks } from "./NavLinks";

type MobileMenuProps = {
  links: { section: string; label: string }[];
  /** Accessible names of the toggle button. Text comes from the server (no messages in the browser). */
  openLabel: string;
  closeLabel: string;
  navLabel: string;
};

/** Menu button and dropdown panel for small screens. The panel sits under the sticky header. */
export function MobileMenu({ links, openLabel, closeLabel, navLabel }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "grid size-11 place-items-center rounded-lg text-fg transition-colors hover:bg-neutral-100 active:bg-neutral-200",
          focusRing,
        )}
      >
        {open ? <X aria-hidden className="size-6" /> : <List aria-hidden className="size-6" />}
      </button>

      <div
        id="site-mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full mt-2 rounded-2xl border border-border bg-surface shadow-popup animate-enter"
      >
        <nav aria-label={navLabel} className="flex flex-col gap-1 p-2">
          <NavLinks links={links} variant="menu" onNavigate={() => setOpen(false)} />
        </nav>
      </div>
    </>
  );
}
