"use client";

import { useEffect, useState } from "react";
import { focusRing } from "@/components/ui/styles";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type NavLinksProps = {
  links: { section: string; label: string }[];
  /** Desktop: a row of small links. Mobile: full-width rows inside the menu. */
  variant: "bar" | "menu";
  onNavigate?: () => void;
};

/**
 * Links to the home page sections. The link of the section on screen is highlighted
 * (only on the home page, where the sections exist).
 */
export function NavLinks({ links, variant, onNavigate }: NavLinksProps) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = links
      .map((link) => document.getElementById(link.section))
      .filter((element): element is HTMLElement => element !== null);
    if (sections.length === 0) return;

    // A section counts as current while it crosses the band just under the header.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [links]);

  return links.map((link) => {
    const isActive = link.section === active;
    return (
      <Link
        key={link.section}
        href={{ pathname: "/", hash: link.section }}
        aria-current={isActive ? "location" : undefined}
        onClick={onNavigate}
        className={cn(
          "font-medium transition-colors",
          variant === "bar"
            ? "rounded-lg px-3 py-2 text-sm text-fg-muted hover:bg-neutral-50 hover:text-fg"
            : "flex h-11 items-center rounded-lg px-3 text-fg hover:bg-neutral-50",
          isActive && "bg-brand-soft text-brand hover:bg-brand-soft hover:text-brand",
          focusRing,
        )}
      >
        {link.label}
      </Link>
    );
  });
}
