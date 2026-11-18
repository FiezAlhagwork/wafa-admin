import Image from "next/image";
import { cn } from "@/lib/cn";

type AvatarSize = "sm" | "md" | "lg" | "xl";

const sizes: Record<AvatarSize, { box: string; text: string; px: string }> = {
  sm: { box: "size-9 rounded-xl", text: "text-sm", px: "2.25rem" },
  md: { box: "size-10.5 rounded-xl", text: "text-[15px]", px: "2.625rem" },
  lg: { box: "size-14 rounded-2xl", text: "text-xl", px: "3.5rem" },
  xl: { box: "size-24 rounded-3xl", text: "text-3xl", px: "6rem" },
};

// Soft background + matching text. Amber keeps ink text (never white or amber text).
const tones = [
  "bg-brand-soft text-brand",
  "bg-teal-soft text-success",
  "bg-amber-soft text-ink",
  "bg-info-soft text-info",
  "bg-warning-soft text-warning",
];

/** First letters of the first two words. A leading "ال" is skipped, so "مطعم الفرات" gives "مف". */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letter = (word: string) => (word.startsWith("ال") && word.length > 3 ? word.charAt(2) : word.charAt(0));
  return words.slice(0, 2).map(letter).join("").toUpperCase() || "؟";
}

type AvatarProps = {
  name: string;
  /** A logo or photo. Falls back to the initials. */
  src?: string | null;
  /** Picks the color, so the same record keeps the same color everywhere (usually its id). */
  seed?: number;
  size?: AvatarSize;
  className?: string;
};

/** A record's picture: its logo when it has one, otherwise its initials on a soft color. Decorative: the name is always next to it. */
export function Avatar({ name, src, seed = 0, size = "md", className }: AvatarProps) {
  const { box, text, px } = sizes[size];

  return (
    <span
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden font-bold",
        box,
        text,
        !src && tones[Math.abs(seed) % tones.length],
        className,
      )}
    >
      {src ? <Image src={src} alt="" fill unoptimized sizes={px} className="object-cover" /> : initialsOf(name)}
    </span>
  );
}
