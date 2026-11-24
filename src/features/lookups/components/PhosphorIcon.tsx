"use client";

import { createElement } from "react";
import { Question } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { usePhosphor } from "../hooks";

type PhosphorIconProps = { iconKey: string; className?: string };

/**
 * The card icon named by `iconKey`, as the apps draw it (filled). While the library loads it keeps its place with a soft
 * block; a key Phosphor does not know shows a question mark, so a broken entry is visible instead of blank.
 */
export function PhosphorIcon({ iconKey, className }: PhosphorIconProps) {
  const library = usePhosphor();
  if (!library.data) {
    return <span aria-hidden className={cn("block animate-pulse rounded-md bg-current opacity-15", className)} />;
  }
  const icon = library.data.iconByKey(iconKey);
  // createElement, not <Icon />: the icon is looked up by name, which the lint rule against components made during
  // render cannot tell apart from a new component (the same library object comes back every time)
  return icon ? (
    createElement(icon, { "aria-hidden": true, weight: "fill", className })
  ) : (
    <Question aria-hidden className={cn("opacity-50", className)} />
  );
}
