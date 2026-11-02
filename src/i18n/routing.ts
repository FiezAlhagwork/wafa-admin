import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "as-needed",
  // The URL alone decides the language: /privacy is always Arabic, even for an English browser.
  // Stores and the apps link to fixed URLs, so the browser language must never redirect them.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
