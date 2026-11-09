/** Home page sections linked from the header. The ids match the sections on the home page. */
export const siteNav = [
  { section: "how", key: "how" },
  { section: "merchants", key: "merchants" },
  { section: "customers", key: "customers" },
  { section: "faq", key: "faq" },
] as const;

export type SiteNavKey = (typeof siteNav)[number]["key"];
