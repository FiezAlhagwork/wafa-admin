"use client";

import type { ReactNode } from "react";
import type { AdminPermission } from "@/lib/api/types";
import { useAdmin } from "./admin-provider";

/**
 * For display only (hide buttons, sidebar items, screens): the server checks every request.
 * Always check a permission, never the role.
 */
export function usePermission(permission: AdminPermission) {
  return useAdmin().permissions.includes(permission);
}

type CanProps = {
  permission: AdminPermission;
  /** Rendered instead when the permission is missing. Nothing by default. */
  fallback?: ReactNode;
  children: ReactNode;
};

export function Can({ permission, fallback = null, children }: CanProps) {
  return usePermission(permission) ? children : fallback;
}
