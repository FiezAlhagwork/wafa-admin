"use client";

import type { ReactElement, ReactNode } from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cn } from "@/lib/cn";
import { popupMotion } from "./styles";

type TooltipSide = "top" | "bottom" | "inline-start" | "inline-end";

type TooltipProps = {
  content: ReactNode;
  /** Logical sides only (`inline-start` = right in RTL). */
  side?: TooltipSide;
  /** The element that shows the tooltip on hover/focus (e.g. an IconButton). */
  children: ReactElement;
};

export function Tooltip({ content, side = "top", children }: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={8} className="z-50">
          <BaseTooltip.Popup
            className={cn(
              "origin-(--transform-origin) rounded-md bg-ink px-2.5 py-1.5 text-xs font-medium text-neutral-0 shadow-popup",
              popupMotion,
            )}
          >
            {content}
            <BaseTooltip.Arrow
              className={cn(
                "size-2 rotate-45 bg-ink",
                "data-[side=top]:-bottom-1 data-[side=bottom]:-top-1",
                "data-[side=inline-start]:-end-1 data-[side=inline-end]:-start-1",
              )}
            />
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
