"use client";

import type { ReactNode } from "react";
import { CaretLeft, Storefront } from "@phosphor-icons/react";
import { Badge, IconTile, Skeleton } from "@/components/ui";
import type { AdminLookup } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { kindText, type LookupKind } from "../kinds";
import { PhosphorIcon } from "./PhosphorIcon";

type GridProps = { items: AdminLookup[]; onOpen: (item: AdminLookup) => void };

/** The tile shell both lists share: the whole tile opens the edit; an inactive one is dashed and gray. */
function Tile({
  item,
  label,
  onOpen,
  className,
  children,
}: {
  item: AdminLookup;
  label: string;
  onOpen: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <li
      className={cn(
        "relative rounded-2xl border transition-colors has-focus-visible:ring-2 has-focus-visible:ring-focus has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-bg",
        item.is_active
          ? "border-ink/6 bg-surface shadow-card hover:border-ink/14"
          : "border-dashed border-border-strong bg-neutral-50",
        className,
      )}
    >
      {/* The tap target covers the tile; the content above it ignores the pointer so clicks reach it */}
      <button type="button" onClick={onOpen} aria-label={label} className="absolute inset-0 rounded-2xl outline-none" />
      <div className="pointer-events-none">{children}</div>
    </li>
  );
}

/** Business types: a row each, the name and its place in the order. */
export function TypesGrid({ items, onOpen }: GridProps) {
  const text = kindText.types;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Tile key={item.id} item={item} label={text.editTitle(item.name)} onOpen={() => onOpen(item)}>
          <div className="flex items-center gap-3 p-4">
            <IconTile icon={<Storefront />} tone={item.is_active ? "brand" : "neutral"} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex flex-wrap items-center gap-2">
                <span className={cn("font-bold", item.is_active ? "text-fg" : "text-fg-muted")}>{item.name}</span>
                {!item.is_active && <Badge>{text.inactive}</Badge>}
              </span>
              <span className="text-xs text-fg-muted">الترتيب {item.sort_order}</span>
            </div>
            <CaretLeft aria-hidden className="size-4.5 shrink-0 text-fg-subtle" />
          </div>
        </Tile>
      ))}
    </ul>
  );
}

/** Card icons: the icon large, as merchants pick it, with its name and its Phosphor key. */
export function IconsGrid({ items, onOpen }: GridProps) {
  const text = kindText.icons;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <Tile key={item.id} item={item} label={text.editTitle(item.name)} onOpen={() => onOpen(item)}>
          <div className="flex flex-col items-center gap-3 p-4 text-center">
            <span
              className={cn(
                "flex size-16 items-center justify-center rounded-2xl",
                item.is_active ? "bg-amber-soft text-ink" : "bg-neutral-100 text-fg-muted",
              )}
            >
              <PhosphorIcon iconKey={item.key ?? ""} className="size-8" />
            </span>
            <span className="flex w-full min-w-0 flex-col gap-0.5">
              <span className={cn("truncate font-bold", item.is_active ? "text-fg" : "text-fg-muted")}>{item.name}</span>
              <span dir="ltr" className="truncate text-xs text-fg-muted">
                {item.key}
              </span>
            </span>
            <span className="flex h-5.5 items-center gap-1.5 text-xs text-fg-muted">
              {item.is_active ? `الترتيب ${item.sort_order}` : <Badge>{text.inactive}</Badge>}
            </span>
          </div>
        </Tile>
      ))}
    </ul>
  );
}

export function LookupGridSkeleton({ kind }: { kind: LookupKind }) {
  if (kind === "icons") {
    return (
      <ul aria-hidden className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <li key={index} className="flex flex-col items-center gap-3 rounded-2xl border border-ink/6 bg-surface p-4 shadow-card">
            <Skeleton className="size-16 rounded-2xl" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-14" />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul aria-hidden className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }, (_, index) => (
        <li key={index} className="flex items-center gap-3 rounded-2xl border border-ink/6 bg-surface p-4 shadow-card">
          <Skeleton className="size-9 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
        </li>
      ))}
    </ul>
  );
}
