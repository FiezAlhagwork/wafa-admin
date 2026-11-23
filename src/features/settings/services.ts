import { api } from "@/lib/api/client";
import type {
  AdminPaymentAccount,
  AppSettings,
  BillingSettings,
  PaymentMethod,
  UpdateAppSettingsBody,
  UpdateBillingSettingsBody,
  UpdatePaymentMethodBody,
} from "@/lib/api/types";

/** GET /admin/settings/billing: what the merchant app's payment screen shows, the trial and the grace period. */
export async function getBillingSettings(): Promise<BillingSettings> {
  const { data } = await api.get<{ data: BillingSettings }>("/admin/settings/billing");
  return data.data;
}

/** PATCH /admin/settings/billing: only the fields that changed. Written to the audit log. */
export async function updateBillingSettings(body: UpdateBillingSettingsBody): Promise<BillingSettings> {
  const { data } = await api.patch<{ data: BillingSettings }>("/admin/settings/billing", body);
  return data.data;
}

/** GET /admin/settings/app: stamps, campaigns, the merchant app version, links and the PIN session. */
export async function getAppSettings(): Promise<AppSettings> {
  const { data } = await api.get<{ data: AppSettings }>("/admin/settings/app");
  return data.data;
}

/** PATCH /admin/settings/app: only the fields that changed. The apps read it at once, no new release needed. */
export async function updateAppSettings(body: UpdateAppSettingsBody): Promise<AppSettings> {
  const { data } = await api.patch<{ data: AppSettings }>("/admin/settings/app", body);
  return data.data;
}

/** PATCH /admin/settings/payment-methods/{method}: only what changed; null clears a text. Needs `account` to be active. */
export async function updatePaymentMethod({
  method,
  ...body
}: UpdatePaymentMethodBody & { method: PaymentMethod }): Promise<AdminPaymentAccount> {
  const { data } = await api.patch<{ data: AdminPaymentAccount }>(`/admin/settings/payment-methods/${method}`, body);
  return data.data;
}

/** POST /admin/settings/payment-methods/{method}/qr: JPEG, PNG or WebP up to 2 MB; replaces the old picture. */
export async function uploadPaymentMethodQr({ method, file }: { method: PaymentMethod; file: File }): Promise<AdminPaymentAccount> {
  const form = new FormData();
  form.append("qr", file);
  const { data } = await api.post<{ data: AdminPaymentAccount }>(`/admin/settings/payment-methods/${method}/qr`, form);
  return data.data;
}

/** DELETE /admin/settings/payment-methods/{method}/qr: `qr_url` becomes null. */
export async function removePaymentMethodQr(method: PaymentMethod): Promise<AdminPaymentAccount> {
  const { data } = await api.delete<{ data: AdminPaymentAccount }>(`/admin/settings/payment-methods/${method}/qr`);
  return data.data;
}
