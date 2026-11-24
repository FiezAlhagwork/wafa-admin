"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import Image from "next/image";
import { ArrowClockwise, ImageBroken } from "@phosphor-icons/react";
import { Button, focusRing, Skeleton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatDateTime, formatRelativeDays } from "@/lib/format";

// The pieces of a payment's details, shared by the review dialog (the queue) and the read-only one (the finance history).

/** One line of the details: the name at the start, the value at the end. Values stay on one line unless they must wrap. */
export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm">
      <dt className="shrink-0 text-fg-muted">{label}</dt>
      <dd className="min-w-0 text-end font-medium text-fg">{children}</dd>
    </div>
  );
}

/** A date on one line ("14 نوفمبر 2026، 9:18 ص") with how long ago, so it never breaks across lines. */
export function When({ iso }: { iso: string }) {
  return (
    <span className="inline-flex flex-wrap items-baseline justify-end gap-x-2">
      <span className="whitespace-nowrap">{formatDateTime(iso)}</span>
      <span className="text-xs font-normal text-fg-muted">{formatRelativeDays(iso)}</span>
    </span>
  );
}

type ProofImageProps = {
  /** `null` when the fresh payment could not be fetched. */
  url: string | null;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  /** A freshly signed URL for the full-size view (the one on screen may have expired while the dialog stayed open). */
  fetchFreshUrl: () => Promise<string | null>;
};

// A thumbnail on small screens (tap it to open the full image), a roomy picture from `md`
const proofBox = "h-44 md:h-80";

/** The proof image. Keyed by its URL, so a refreshed link gets a clean "broken" state. */
export function ProofImage({ url, loading, refreshing, onRefresh, fetchFreshUrl }: ProofImageProps) {
  const [broken, setBroken] = useState(false);

  if (loading) return <Skeleton className={cn(proofBox, "w-full rounded-lg")} />;

  if (url === null || broken) {
    return (
      <div
        className={cn(
          proofBox,
          "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-strong bg-neutral-50 p-4 text-center",
        )}
      >
        <ImageBroken aria-hidden className="size-8 text-fg-subtle" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-fg">تعذّر تحميل الصورة</p>
          <p className="text-xs text-fg-muted">رابط الصورة ينتهي بعد 30 دقيقة، حدّثه وأعد المحاولة.</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowClockwise className="size-4" />}
          loading={refreshing}
          onClick={onRefresh}
        >
          تحديث الصورة
        </Button>
      </div>
    );
  }

  // The tab opens at once (inside the click, so it is not blocked as a popup), then gets the freshly signed URL
  const openFull = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const tab = window.open("", "_blank");
    if (!tab) return;
    tab.opener = null;
    const fresh = await fetchFreshUrl().catch(() => null);
    if (fresh) tab.location.href = fresh;
    else tab.close();
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => void openFull(event)}
      aria-label="فتح صورة الإثبات بحجم كامل في تبويب جديد"
      className={cn("relative block overflow-hidden rounded-lg border border-border bg-neutral-50", proofBox, focusRing)}
    >
      {/* The URL is signed and expires: no point optimizing or caching it */}
      <Image
        src={url}
        alt="صورة إثبات الدفع"
        fill
        unoptimized
        className="object-contain"
        onError={() => setBroken(true)}
      />
    </a>
  );
}
