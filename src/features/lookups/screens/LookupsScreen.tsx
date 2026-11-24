"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Shapes } from "@phosphor-icons/react";
import { Button, Card, EmptyState, ErrorState, Tabs } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { getErrorMessage } from "@/lib/api/errors";
import type { AdminLookup } from "@/lib/api/types";
import { formatNumber } from "@/lib/format";
import { IconsGrid, LookupGridSkeleton, TypesGrid } from "../components/LookupGrids";
import { LookupFormDialog } from "../components/LookupFormDialog";
import { useLookups } from "../hooks";
import { kindText, lookupKinds, parseKind, type LookupKind } from "../kinds";

/**
 * What merchants pick from in the apps: the business types (at sign-up) and the card icons (when making a card).
 * The tab lives in the URL (`?tab=icons`), so a view can be saved and shared. No pagination: a few dozen at most.
 */
export function LookupsScreen() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const kind = parseKind(searchParams.get("tab"));
  const text = kindText[kind];

  const [editing, setEditing] = useState<"new" | AdminLookup | null>(null);
  // Both lists load, so each tab can show its count
  const types = useLookups("types");
  const icons = useLookups("icons");
  const query = kind === "types" ? types : icons;
  const counts: Record<LookupKind, number | undefined> = { types: types.data?.length, icons: icons.data?.length };

  const changeKind = (next: LookupKind) =>
    router.replace(next === "types" ? pathname : `${pathname}?tab=${next}`, { scroll: false });

  const addButton = (
    <Button variant="accent" icon={<Plus className="size-4" weight="bold" />} onClick={() => setEditing("new")}>
      {text.add}
    </Button>
  );

  let body;
  if (query.isPending) {
    body = <LookupGridSkeleton kind={kind} />;
  } else if (query.data === undefined) {
    body = (
      <Card>
        <ErrorState description={getErrorMessage(query.error)} onRetry={() => void query.refetch()} retrying={query.isFetching} />
      </Card>
    );
  } else if (query.data.length === 0) {
    body = (
      <Card>
        <EmptyState icon={<Shapes />} title={text.empty.title} description={text.empty.description} action={addButton} />
      </Card>
    );
  } else {
    body =
      kind === "types" ? (
        <TypesGrid items={query.data} onOpen={setEditing} />
      ) : (
        <IconsGrid items={query.data} onOpen={setEditing} />
      );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="الأنواع والأيقونات"
        description="ما يختار منه التاجر في التطبيق: نوع نشاطه عند التسجيل، وأيقونة بطاقته عند إنشائها."
        actions={addButton}
      />
      <Tabs
        label="القائمة"
        value={kind}
        onValueChange={changeKind}
        items={lookupKinds.map((value) => ({
          value,
          label: (
            <>
              {kindText[value].tab}
              {counts[value] !== undefined && (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-bold text-fg-muted tabular-nums">
                  {formatNumber(counts[value])}
                </span>
              )}
            </>
          ),
        }))}
      />
      {body}
      {editing !== null && (
        // Keyed by entry so opening another one starts from its own values
        <LookupFormDialog
          key={`${kind}-${editing === "new" ? "new" : editing.id}`}
          kind={kind}
          target={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
