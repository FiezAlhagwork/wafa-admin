import { cn } from "@/lib/cn";
import type { Reveal } from "./RevealOnScroll";

type SectionHeadingProps = {
  /** id of the heading, for the section's aria-labelledby. */
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "start" | "center";
  className?: string;
  /** Overrides the title size, for sections where the default is too large. */
  titleClassName?: string;
  /** Where the heading comes in from the first time it scrolls into view. */
  reveal?: Reveal;
};

/** Small label, title and optional lead at the top of a home page section. */
export function SectionHeading({ id, eyebrow, title, lead, align = "center", className, titleClassName, reveal = "up" }: SectionHeadingProps) {
  return (
    // data-reveal: comes in from the given side the first time it scrolls into view (RevealOnScroll)
    <div data-reveal={reveal} className={cn("flex max-w-2xl flex-col", align === "center" ? "mx-auto items-center text-center" : "items-start", className)}>
      <p className="text-sm font-bold text-brand">{eyebrow}</p>
      <h2 id={id} className={cn("mt-2 text-3xl font-black text-fg sm:text-4xl", titleClassName)}>
        {title}
      </h2>
      {lead && <p className="mt-4 text-lg leading-8 text-fg-muted">{lead}</p>}
    </div>
  );
}
