import { Suspense } from "react";
import type { Metadata } from "next";
import { PermissionGate } from "@/components/layout/PermissionGate";
import { FinanceScreen } from "@/features/finance/screens/FinanceScreen";

export const metadata: Metadata = { title: "المالية" };

export default function FinancePage() {
  return (
    <PermissionGate permission="view-financials">
      {/* The screen reads ?view=, the period and the history's filters from the URL */}
      <Suspense>
        <FinanceScreen />
      </Suspense>
    </PermissionGate>
  );
}
