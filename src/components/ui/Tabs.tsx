"use client";

import type { ReactNode } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cn } from "@/lib/cn";
import { focusRing } from "./styles";

type TabItem<T extends string> = { value: T; label: ReactNode };

type TabsProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  items: TabItem<T>[];
  /** Accessible name of the tab list (e.g. "حالة الدفعات"). */
  label: string;
  className?: string;
};

/**
 * A row of tabs that only switches a value (usually a filter kept in the URL): there are no panels,
 * the content below reads the same value. Arrow keys move between tabs.
 */
export function Tabs<T extends string>({ value, onValueChange, items, label, className }: TabsProps<T>) {
  return (
    <BaseTabs.Root value={value} onValueChange={onValueChange}>
      <BaseTabs.List
        aria-label={label}
        className={cn("flex gap-1 overflow-x-auto border-b border-divider scrollbar-none", className)}
      >
        {items.map((item) => (
          <BaseTabs.Tab
            key={item.value}
            value={item.value}
            className={cn(
              "-mb-px inline-flex h-12 shrink-0 items-center gap-2 rounded-t-md border-b-[3px] border-transparent px-3.5 text-[14.5px] font-medium whitespace-nowrap text-fg-muted transition-colors select-none",
              "hover:text-fg data-active:border-amber data-active:font-bold data-active:text-fg",
              "data-disabled:cursor-not-allowed data-disabled:opacity-50",
              focusRing,
            )}
          >
            {item.label}
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
    </BaseTabs.Root>
  );
}
