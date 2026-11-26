/** Home page sections linked from the header, in display order. Each id matches a section on the home page. */
export const siteNav = ["features", "how", "pricing", "faq"] as const;

export type SiteSection = (typeof siteNav)[number];
