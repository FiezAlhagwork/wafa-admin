"use client";

import { useEffect, useRef, useState } from "react";
import { Hourglass, MagnifyingGlass, X } from "@phosphor-icons/react";
import { Button, Card, IconButton, Input, Tabs } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { MerchantFilters as Filters } from "../filters";
import { statusOptions } from "../labels";

const SEARCH_DELAY_MS = 400;

type MerchantFiltersProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

/** Status tabs, search and "trial ends this week". The search waits for a pause in typing before it reaches the URL. */
export function MerchantFilters({ filters, onChange }: MerchantFiltersProps) {
  const [text, setText] = useState(filters.q);
  // The last search this box sent: when the URL catches up with it, the box keeps what was typed since
  const [sentQ, setSentQ] = useState(filters.q);

  // The URL changed from outside (back button, a link): the box follows it
  const [seenQ, setSeenQ] = useState(filters.q);
  if (filters.q !== seenQ) {
    setSeenQ(filters.q);
    if (filters.q !== sentQ) setText(filters.q);
  }

  // The search reaches the URL after a pause in typing. The cleanup also stops a pending search once the screen is
  // gone (it would pull the user back to this list).
  const pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (text === filters.q) return;
    pending.current = setTimeout(() => {
      setSentQ(text);
      onChange({ ...filters, q: text });
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(pending.current);
  }, [text, filters, onChange]);

  // Any other filter change sends what is typed with it and drops the pending search: a tab clicked while typing is
  // kept, never undone by an older timer that fires before the URL has caught up.
  const commit = (next: Filters) => {
    clearTimeout(pending.current);
    setSentQ(next.q);
    onChange(next);
  };

  const search = (next: string) => setText(next);

  const clear = () => {
    setText("");
    commit({ ...filters, q: "" });
  };

  const tooShort = text.trim().length === 1;

  return (
    <Card className="overflow-hidden">
      <Tabs
        label="حالة التاجر"
        value={filters.status}
        onValueChange={(status) => commit({ ...filters, status, q: text })}
        items={statusOptions}
        className="px-3"
      />

      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-start">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-1 sm:basis-72">
          <div className="relative">
            <Input
              type="search"
              aria-label="بحث في التجار"
              placeholder="اسم النشاط أو البريد أو رقم الهاتف"
              startIcon={<MagnifyingGlass />}
              value={text}
              onChange={(event) => search(event.target.value)}
              className={cn("border-neutral-200 bg-neutral-50 focus-visible:bg-surface", text && "pe-10")}
              autoComplete="off"
            />
            {text && (
              <IconButton
                label="مسح البحث"
                icon={<X className="size-4" />}
                size="sm"
                className="absolute end-1.5 top-1/2 -translate-y-1/2"
                onClick={clear}
              />
            )}
          </div>
          {tooShort && <p className="text-xs text-fg-muted">اكتب حرفين على الأقل للبحث.</p>}
        </div>

        <Button
          variant="secondary"
          aria-pressed={filters.trialEnding}
          icon={<Hourglass className="size-4.5" />}
          className={cn(
            filters.trialEnding
              ? "border-brand bg-brand-soft text-brand hover:bg-brand-soft active:bg-brand-soft"
              : "border-dashed border-neutral-400 font-medium text-neutral-700",
          )}
          onClick={() => commit({ ...filters, trialEnding: !filters.trialEnding, q: text })}
        >
          تنتهي تجربته هذا الأسبوع
          {filters.trialEnding && <X aria-hidden className="size-3.5" />}
        </Button>
      </div>
    </Card>
  );
}
