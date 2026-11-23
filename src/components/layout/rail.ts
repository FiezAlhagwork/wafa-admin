import { cn } from "@/lib/cn";

/**
 * How the sidebar folds into the icon rail. One timing for the column (Shell), the rows that shrink with it and the
 * text that fades. Nothing jumps: every row keeps its start padding, so each icon, the logo and the avatar stay
 * centred on the 72px rail (36px from the start edge) at every frame. Only widths and opacity move.
 */
export const railMotion = "duration-200 ease-out motion-reduce:transition-none";

/** A row that shrinks with the column to the rail's 48px (12px from each edge of the 72px rail). */
export const railRow = (collapsed: boolean) => cn("transition-[width]", railMotion, collapsed ? "w-12" : "w-full");

/** Text that stays laid out (no reflow, no "…") and fades while the column clips it. */
export const railFade = (collapsed: boolean, visibleWhenCollapsed = false) =>
  cn("transition-opacity", railMotion, collapsed !== visibleWhenCollapsed && "opacity-0");
