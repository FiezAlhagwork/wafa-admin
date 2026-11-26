"use client";

import { ArrowUp } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { focusRingOnBlue } from "./styles";

/** Scrolled this far, the button shows. */
const showBelow = 600;

/** A round button in the bottom corner that appears once the reader is well down the page and takes them back to the top. */
export function BackToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showBelow);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={toTop}
      inert={!visible}
      className={cn(
        "fixed end-5 bottom-5 z-30 grid size-12 place-items-center rounded-full bg-brand text-neutral-0 shadow-popup transition-all duration-300 hover:bg-brand-hover sm:end-8 sm:bottom-8 motion-reduce:transition-none print:hidden",
        focusRingOnBlue,
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <ArrowUp aria-hidden weight="bold" className="size-5" />
    </button>
  );
}
