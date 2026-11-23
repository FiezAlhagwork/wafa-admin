// Convenience aliases over the generated schema. Never edit schema.d.ts by hand: run `npm run gen:api`.
import type { components, operations } from "./schema";

type Schemas = components["schemas"];

export type AdminUser = Schemas["AdminUser"];
export type AdminRole = Schemas["AdminRole"];
export type AdminPermission = Schemas["AdminPermission"];
export type ErrorCode = Schemas["ErrorCode"];
export type ErrorResponse = Schemas["ErrorResponse"];

export type AdminMeResponse = operations["adminMe"]["responses"][200]["content"]["application/json"];
export type AdminOverview = Schemas["AdminOverview"];
export type AdminPayment = Schemas["AdminPayment"];
export type PaymentStatus = AdminPayment["status"];
export type PaymentMethod = Schemas["PaymentMethod"];
export type PaymentRejectionReason = Schemas["PaymentRejectionReason"];

export type CreateAdminUserBody = operations["adminCreateAdminUser"]["requestBody"]["content"]["application/json"];
export type UpdateAdminUserBody = operations["adminUpdateAdminUser"]["requestBody"]["content"]["application/json"];

export type MerchantStatus = Schemas["MerchantStatus"];
export type AdminMerchant = Schemas["AdminMerchant"];
export type AdminMerchantDetail = Schemas["AdminMerchantDetail"];
export type ListMerchantsQuery = NonNullable<operations["adminListMerchants"]["parameters"]["query"]>;
export type UpdateMerchantIdentityBody =
  operations["adminUpdateMerchantIdentity"]["requestBody"]["content"]["application/json"];
export type ExtendTrialBody = operations["adminExtendTrial"]["requestBody"]["content"]["application/json"];
export type MerchantCard = AdminMerchantDetail["cards"][number];
export type AdminLookup = Schemas["AdminLookup"];

export type AdminCustomer = Schemas["AdminCustomer"];
export type CustomerCycle = NonNullable<AdminCustomer["cycles"]>[number];
export type AdminCardCycle = Schemas["AdminCardCycle"];
export type CycleStamp = AdminCardCycle["stamps"][number];
export type UpdateCustomerBirthdateBody =
  operations["adminUpdateCustomerBirthdate"]["requestBody"]["content"]["application/json"];

export type AdminPackage = Schemas["AdminPackage"];
export type PackageDuration = AdminPackage["prices"][number]["duration_months"];
type PackageInput = Schemas["PackageInput"];
// Written by hand: the generated create body is `PackageInput & Record<string, never>` (openapi.yaml's required list
// on POST /admin/packages comes out as an empty object), which no value can satisfy. Required fields per the guide §5.8.
export type CreatePackageBody = Required<Pick<PackageInput, "name" | "cards_limit" | "weekly_campaigns_limit" | "prices">> &
  Pick<PackageInput, "is_active" | "sort_order">;
export type UpdatePackageBody = operations["adminUpdatePackage"]["requestBody"]["content"]["application/json"];

export type BillingSettings = operations["adminGetBillingSettings"]["responses"][200]["content"]["application/json"]["data"];
export type UpdateBillingSettingsBody =
  operations["adminUpdateBillingSettings"]["requestBody"]["content"]["application/json"];
export type AppSettings = Schemas["AppSettings"];
export type UpdateAppSettingsBody = operations["adminUpdateAppSettings"]["requestBody"]["content"]["application/json"];
export type AdminPaymentAccount = Schemas["AdminPaymentAccount"];
export type UpdatePaymentMethodBody =
  operations["adminUpdatePaymentMethod"]["requestBody"]["content"]["application/json"];
