"use client";

import { ArrowClockwise, WarningOctagon } from "@phosphor-icons/react";
import { thmanyah } from "@/lib/fonts";
import "@/styles/globals.css";

/**
 * An error in a root layout (website or dashboard). It replaces the whole document, so it brings its own html/body,
 * font and styles. Arabic first with an English line, since it can happen on either part. `metadata` is not supported
 * here: the title is a React <title>.
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="ar" dir="rtl" className={thmanyah.variable}>
      <body className="flex min-h-dvh items-center justify-center bg-bg p-4">
        <title>حدث خطأ · وفاء</title>
        <main
          role="alert"
          className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-ink/6 bg-surface p-8 text-center shadow-card"
        >
          <span aria-hidden className="flex size-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
            <WarningOctagon className="size-7" />
          </span>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-black text-fg">حدث خطأ غير متوقع</h1>
            <p className="text-sm text-fg-muted">حاول مرة أخرى، وإذا تكرّر الخطأ أعد تحميل الصفحة.</p>
            <p dir="ltr" lang="en" className="text-sm text-fg-muted">
              Something went wrong. Please try again.
            </p>
          </div>
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex h-10.5 cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-brand-on transition-colors outline-none hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          >
            <ArrowClockwise aria-hidden className="size-4" />
            إعادة المحاولة
          </button>
        </main>
      </body>
    </html>
  );
}
