import Image from "next/image";
import { createAvatar } from "@dicebear/core";
import * as identicon from "@dicebear/identicon";
import { cn } from "@/lib/cn";

type AvatarSize = "sm" | "md" | "lg" | "xl";

const sizes: Record<AvatarSize, string> = {
  sm: "size-9",
  md: "size-10.5",
  lg: "size-14",
  xl: "size-24",
};

// The brand colors from globals.css (brand, success, amber, info, ink), as the image generator needs them: it draws an
// SVG and can't read CSS variables. Keep in step with the tokens.
const brandColors = ["1B4F72", "0E7C73", "F2B134", "2F6FD6", "14213D"];

/** A geometric pattern drawn from the record's id (an identicon, like GitHub's): the same id always gives the same one. */
const identiconUri = (seed: number) =>
  createAvatar(identicon, { seed: String(seed), rowColor: brandColors }).toDataUri();

type AvatarProps = {
  /** The record's name. Only for the picture's purpose: the name is always shown next to it. */
  name: string;
  /** A logo or photo. Falls back to the pattern. */
  src?: string | null;
  /** Picks the pattern and its color, so the same record looks the same everywhere (its id). */
  seed?: number;
  size?: AvatarSize;
  className?: string;
};

/** A record's picture: its logo when it has one, otherwise a pattern from its id. Decorative: the name is always next to it. */
export function Avatar({ src, seed = 0, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn("relative flex shrink-0 overflow-hidden rounded-full bg-neutral-100 ring-1 ring-ink/6", sizes[size], className)}
    >
      {src ? (
        <Image src={src} alt="" fill unoptimized className="object-cover" />
      ) : (
        // A margin inside the circle, so the pattern breathes like GitHub's
        <span className="absolute inset-[22%] bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url("${identiconUri(seed)}")` }} />
      )}
    </span>
  );
}
