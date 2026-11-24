import { Suspense } from "react";
import type { Metadata } from "next";
import { PermissionGate } from "@/components/layout/PermissionGate";
import { DeletionRequestsScreen } from "@/features/deletion-requests/screens/DeletionRequestsScreen";

export const metadata: Metadata = { title: "طلبات الحذف" };

export default function DeletionRequestsPage() {
  return (
    <PermissionGate permission="execute-deletion-requests">
      {/* The screen reads ?status= and ?type= from the URL */}
      <Suspense>
        <DeletionRequestsScreen />
      </Suspense>
    </PermissionGate>
  );
}
