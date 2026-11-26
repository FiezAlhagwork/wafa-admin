"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** How far the page must scroll in one go before the header reacts, so a shaky trackpad doesn't flicker it. */
const threshold = 8;
/** Near the top the header always shows. */
const alwaysShownAbove = 120;

/**
 * The site header's outer element: it slides away while the reader scrolls down and comes back
 * as soon as they scroll up. It stays put while anything inside it has keyboard focus.
 */
export function AutoHideHeader({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let queued = false;

    const update = () => {
      queued = false;
      const y = window.scrollY;
      const delta = y - last;
      if (Math.abs(delta) < threshold) return;
      last = y;
      const focusInside = ref.current?.contains(document.activeElement) ?? false;
      setHidden(delta > 0 && y > alwaysShownAbove && !focusInside);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={ref}
      onFocusCapture={() => setHidden(false)}
      className={cn(
        className,
        "transition-transform duration-300 ease-out motion-reduce:transition-none",
        hidden && "-translate-y-[calc(100%+1rem)]",
      )}
    >
      {children}
    </header>
  );
}
