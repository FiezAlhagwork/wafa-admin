"use client";

import type { ReactNode } from "react";
import { LockKey } from "@phosphor-icons/react";
import { Card, EmptyState } from "@/components/ui";
import { Can } from "@/lib/auth/can";
import type { AdminPermission } from "@/lib/api/types";

/**
 * Wraps a whole screen. Without the permission the user sees a message instead of the screen, even if they
 * typed the URL by hand. Display only: the server checks every request anyway.
 */
export function PermissionGate({ permission, children }: { permission: AdminPermission; children: ReactNode }) {
  return (
    <Can
      permission={permission}
      fallback={
        <Card>
          <EmptyState
            icon={<LockKey />}
            title="ليس لديك صلاحية لهذه الصفحة"
            description="دورك الحالي لا يتيح فتح هذه الصفحة. إذا كنت تحتاجها، تواصل مع مدير المنصة."
          />
        </Card>
      }
    >
      {children}
    </Can>
  );
}
