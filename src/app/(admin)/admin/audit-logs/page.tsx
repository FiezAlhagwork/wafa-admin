import { Suspense } from "react";
import type { Metadata } from "next";
import { PermissionGate } from "@/components/layout/PermissionGate";
import { AuditLogScreen } from "@/features/audit-logs/screens/AuditLogScreen";

export const metadata: Metadata = { title: "سجل التدقيق" };

export default function AuditLogsPage() {
  return (
    <PermissionGate permission="view-audit-log">
      {/* The screen reads its filters from the URL */}
      <Suspense>
        <AuditLogScreen />
      </Suspense>
    </PermissionGate>
  );
}
