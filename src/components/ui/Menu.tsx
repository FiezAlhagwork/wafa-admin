"use client";

import type { ComponentProps, ReactElement, ReactNode } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cn } from "@/lib/cn";
import { popupMotion, popupSurface } from "./styles";

type MenuProps = {
  /** A Button or IconButton; it becomes the menu trigger. */
  trigger: ReactElement;
  /** Alignment against the trigger (logical: `end` = left in RTL). */
  align?: "start" | "center" | "end";
  className?: string;
  children: ReactNode;
};

export function Menu({ trigger, align = "end", className, children }: MenuProps) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner side="bottom" align={align} sideOffset={6} className="z-50 outline-none">
          <BaseMenu.Popup className={cn(popupSurface, popupMotion, "min-w-48 origin-(--transform-origin) p-1", className)}>
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

type MenuItemProps = Omit<ComponentProps<typeof BaseMenu.Item>, "className"> & {
  icon?: ReactNode;
  /** `danger` for destructive actions (suspend, delete). */
  tone?: "default" | "danger";
  className?: string;
};

export function MenuItem({ icon, tone = "default", className, children, ...props }: MenuItemProps) {
  return (
    <BaseMenu.Item
      className={cn(
        "flex h-9 cursor-default items-center gap-2.5 rounded-lg px-3 text-sm outline-none select-none",
        "data-disabled:pointer-events-none data-disabled:text-fg-subtle [&_svg]:size-4.5 [&_svg]:shrink-0",
        tone === "danger"
          ? "text-danger data-highlighted:bg-danger-soft"
          : "text-fg data-highlighted:bg-neutral-100 [&_svg]:text-fg-muted",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </BaseMenu.Item>
  );
}

export function MenuSeparator() {
  return <BaseMenu.Separator className="-mx-1 my-1 h-px bg-border" />;
}

/** A labeled group of items. */
export function MenuGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <BaseMenu.Group>
      <BaseMenu.GroupLabel className="px-3 pt-2 pb-1 text-xs font-medium text-fg-muted">{label}</BaseMenu.GroupLabel>
      {children}
    </BaseMenu.Group>
  );
}
