import { Suspense } from "react";
import { PermissionGate } from "@/components/layout/PermissionGate";
import { PaymentsScreen } from "@/features/payments/screens/PaymentsScreen";

export default function PaymentsPage() {
  return (
    <PermissionGate permission="review-payments">
      {/* The screen reads ?status= from the URL */}
      <Suspense>
        <PaymentsScreen />
      </Suspense>
    </PermissionGate>
  );
}
