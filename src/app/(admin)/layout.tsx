import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { UiProvider } from "@/components/ui";
import { thmanyah } from "@/lib/fonts";
import { QueryProvider } from "@/lib/query-provider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "لوحة وفا", template: "%s — لوحة وفا" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={thmanyah.variable}>
      <body className="min-h-dvh">
        {/* Clerk goes to "/" (the website) after sign-out by default; the dashboard goes back to its sign-in page */}
        <ClerkProvider afterSignOutUrl="/sign-in">
          <QueryProvider>
            <UiProvider>{children}</UiProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
