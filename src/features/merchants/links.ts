import type { AdminMerchantDetail, MerchantLink } from "@/lib/api/types";

/** Each link by the key the API removes it by: the field of `links` that holds it, and its name. In page order. */
export const merchantLinks: Record<MerchantLink, { field: keyof AdminMerchantDetail["links"]; label: string }> = {
  instagram: { field: "instagram_url", label: "إنستغرام" },
  facebook: { field: "facebook_url", label: "فيسبوك" },
  maps: { field: "maps_url", label: "الموقع على الخريطة" },
};

/** The links the merchant has, in page order. */
export const presentLinks = (links: AdminMerchantDetail["links"]) =>
  (Object.keys(merchantLinks) as MerchantLink[]).flatMap((key) => {
    const url = links[merchantLinks[key].field];
    return url ? [{ key, url, label: merchantLinks[key].label }] : [];
  });

const parse = (url: string) => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};

/**
 * The address to open, only for http(s). The merchant typed it, and `format: uri` alone does not rule out
 * `javascript:` and the like, so anything else is shown as text and never becomes a link.
 */
export function safeHref(url: string): string | null {
  const parsed = parse(url);
  return parsed && (parsed.protocol === "https:" || parsed.protocol === "http:") ? parsed.href : null;
}

/** "https://www.instagram.com/yasmin.cafe/" → "instagram.com/yasmin.cafe": what a person recognises at a glance. */
export function shortUrl(url: string): string {
  const parsed = parse(url);
  if (!parsed || !safeHref(url)) return url;
  const path = `${parsed.pathname}${parsed.search}`.replace(/\/$/, "");
  return `${parsed.hostname.replace(/^www\./, "")}${path}`;
}
