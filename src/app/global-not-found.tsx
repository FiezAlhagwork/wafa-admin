import type { Metadata } from "next";
import Link from "next/link";
import { thmanyah } from "@/lib/fonts";
import "@/styles/globals.css";

// A URL that matches no route, on the website or the dashboard. With two root layouts there is no single layout to
// build a 404 from, so this page brings its own document, font and styles (enabled by experimental.globalNotFound).

export const metadata: Metadata = {
  title: "الصفحة غير موجودة · وفاء",
};

export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl" className={thmanyah.variable}>
      <body className="flex min-h-dvh items-center justify-center bg-bg p-4">
        <main className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-ink/6 bg-surface p-8 text-center shadow-card">
          <span className="text-6xl font-black text-amber tabular-nums">404</span>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-black text-fg">الصفحة غير موجودة</h1>
            <p className="text-sm text-fg-muted">ربما تغيّر الرابط أو حُذفت الصفحة.</p>
            <p dir="ltr" lang="en" className="text-sm text-fg-muted">
              This page could not be found.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-10.5 items-center rounded-xl bg-brand px-4 text-sm font-bold text-brand-on transition-colors outline-none hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          >
            إلى الصفحة الرئيسية
          </Link>
        </main>
      </body>
    </html>
  );
}
