import { policy } from "@/site/legal/policy-config";

/**
 * Values the home page needs, kept in one place.
 * The merchant app is an APK sent directly to merchants, so merchants reach us on WhatsApp.
 */
export const home = {
  /** Same number as the legal pages, digits only for wa.me links. */
  whatsapp: policy.phone.replace(/[^\d]/g, ""),
};

/** wa.me link with a prefilled message. */
export function whatsappLink(message: string) {
  return `https://wa.me/${home.whatsapp}?text=${encodeURIComponent(message)}`;
}
