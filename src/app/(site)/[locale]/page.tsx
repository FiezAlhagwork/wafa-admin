import { setRequestLocale } from "next-intl/server";

// Temporary placeholder. The real home page comes in step 6 (text from messages/*.json).
export default async function SiteHomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <main className="p-8" />;
}
