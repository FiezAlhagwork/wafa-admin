// Convenience aliases over the generated schema. Never edit schema.d.ts by hand: run `npm run gen:api`.
import type { components, operations } from "./schema";

type Schemas = components["schemas"];

export type AdminUser = Schemas["AdminUser"];
export type AdminRole = Schemas["AdminRole"];
export type AdminPermission = Schemas["AdminPermission"];
export type ErrorCode = Schemas["ErrorCode"];
export type ErrorResponse = Schemas["ErrorResponse"];

export type AdminMeResponse = operations["adminMe"]["responses"][200]["content"]["application/json"];
