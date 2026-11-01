"use client";

import type { ReactNode } from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { CheckCircle, Info, Warning, WarningCircle, X } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";
import { IconButton } from "./IconButton";

type ToastType = "success" | "error" | "warning" | "info";

type ToastOptions = {
  description?: ReactNode;
  /** Same id = the existing toast is updated instead of stacking a duplicate (e.g. "forbidden"). */
  id?: string;
  /** ms; 0 keeps it until closed. */
  timeout?: number;
};

// One global manager, so code outside React (the API error layer, QueryClient onError) can show toasts.
const manager = BaseToast.createToastManager();

const show = (type: ToastType, title: ReactNode, { description, id, timeout }: ToastOptions = {}) =>
  manager.add({
    type,
    title,
    description,
    id,
    timeout: timeout ?? (type === "error" ? 7000 : 5000),
    priority: type === "error" || type === "warning" ? "high" : "low",
  });

export const toast = {
  success: (title: ReactNode, options?: ToastOptions) => show("success", title, options),
  error: (title: ReactNode, options?: ToastOptions) => show("error", title, options),
  warning: (title: ReactNode, options?: ToastOptions) => show("warning", title, options),
  info: (title: ReactNode, options?: ToastOptions) => show("info", title, options),
  close: (id?: string) => manager.close(id),
};

const types: Record<ToastType, { icon: ReactNode; bar: string; iconColor: string }> = {
  success: { icon: <CheckCircle weight="fill" />, bar: "before:bg-success", iconColor: "text-success" },
  error: { icon: <WarningCircle weight="fill" />, bar: "before:bg-danger", iconColor: "text-danger" },
  warning: { icon: <Warning weight="fill" />, bar: "before:bg-warning", iconColor: "text-warning" },
  info: { icon: <Info weight="fill" />, bar: "before:bg-info", iconColor: "text-info" },
};

const isToastType = (type: string | undefined): type is ToastType => type !== undefined && type in types;

// Stacking, expand-on-hover and swipe use the CSS variables Base UI sets on each toast.
const rootClass = cn(
  "[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
  "[--height:var(--toast-frontmost-height,var(--toast-height))]",
  "[--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]",
  "absolute inset-x-0 bottom-0 z-[calc(1000-var(--toast-index))] origin-bottom select-none",
  "h-(--height) data-expanded:h-(--toast-height)",
  "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]",
  "data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
  "data-starting-style:[transform:translateY(150%)]",
  "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
  "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
  "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
  "data-ending-style:opacity-0 data-limited:opacity-0",
  "[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]",
  // Gap filler so hovering between toasts keeps the stack expanded
  "after:absolute after:inset-x-0 after:top-full after:h-[calc(var(--gap)+1px)] after:content-['']",
  // Surface + colored bar on the start side
  "overflow-hidden rounded-xl border border-border bg-surface shadow-popup",
  "before:absolute before:inset-y-0 before:start-0 before:w-1 before:content-['']",
);

function ToastList() {
  const { toasts } = BaseToast.useToastManager();

  return toasts.map((item) => {
    const type = types[isToastType(item.type) ? item.type : "info"];
    return (
      <BaseToast.Root key={item.id} toast={item} swipeDirection={["down", "right"]} className={cn(rootClass, type.bar)}>
        <BaseToast.Content className="flex items-start gap-3 overflow-hidden p-4 ps-5 transition-opacity duration-250 data-behind:opacity-0 data-expanded:opacity-100">
          <span aria-hidden className={cn("mt-0.5 shrink-0 [&>svg]:size-5", type.iconColor)}>
            {type.icon}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <BaseToast.Title className="text-sm font-bold text-fg" />
            <BaseToast.Description className="text-sm text-fg-muted" />
          </div>
          <BaseToast.Close
            render={<IconButton label="إغلاق" icon={<X className="size-4" />} size="sm" className="-me-1.5 -mt-1.5 size-7" />}
          />
        </BaseToast.Content>
      </BaseToast.Root>
    );
  });
}

/** Mounted once in the dashboard root (via UiProvider). Toasts sit bottom-start (bottom-right in RTL). */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <BaseToast.Provider toastManager={manager} limit={3}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport className="fixed bottom-6 start-6 z-50 w-[calc(100vw-3rem)] outline-none sm:w-90">
          <ToastList />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}
