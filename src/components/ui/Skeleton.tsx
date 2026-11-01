import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Gray placeholder while data loads. Size it with className (e.g. "h-4 w-32"). */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-neutral-100", className)} {...props} />;
}
