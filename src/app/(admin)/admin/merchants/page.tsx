import { Suspense } from "react";
import { PermissionGate } from "@/components/layout/PermissionGate";
import { MerchantsScreen } from "@/features/merchants/screens/MerchantsScreen";

export default function MerchantsPage() {
  return (
    <PermissionGate permission="view-merchants-and-customers">
      {/* The screen reads its filters from the URL */}
      <Suspense>
        <MerchantsScreen />
      </Suspense>
    </PermissionGate>
  );
}
