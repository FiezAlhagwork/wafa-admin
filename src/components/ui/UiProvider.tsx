"use client";

import type { ReactNode } from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { ToastProvider } from "./Toast";

type UiProviderProps = {
  /** Base UI needs it for keyboard navigation and logical alignment. The dashboard is always RTL. */
  direction?: "rtl" | "ltr";
  children: ReactNode;
};

/** Everything components/ui needs at the root: direction, shared tooltip delay, and the toast viewport. */
export function UiProvider({ direction = "rtl", children }: UiProviderProps) {
  return (
    <DirectionProvider direction={direction}>
      <BaseTooltip.Provider delay={400}>
        <ToastProvider>{children}</ToastProvider>
      </BaseTooltip.Provider>
    </DirectionProvider>
  );
}
