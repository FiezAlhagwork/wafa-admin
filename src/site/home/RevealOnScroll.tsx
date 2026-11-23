"use client";

import { useEffect } from "react";

/**
 * Reveals the blocks marked data-reveal the first time each one scrolls into view, then stops watching it,
 * so every block animates once. Renders nothing; the styles are in globals.css.
 */
export function RevealOnScroll() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (items.length === 0 || !("IntersectionObserver" in window)) return;

    // What the reader can already see stays shown, so nothing on screen blinks out when the hiding starts
    for (const item of items) {
      if (item.getBoundingClientRect().top < window.innerHeight) item.dataset.revealed = "";
    }
    const root = document.documentElement;
    root.classList.add("reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    for (const item of items) {
      if (item.dataset.revealed === undefined) observer.observe(item);
    }

    return () => {
      observer.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
