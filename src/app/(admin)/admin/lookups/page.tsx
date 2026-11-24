import { Suspense } from "react";
import type { Metadata } from "next";
import { PermissionGate } from "@/components/layout/PermissionGate";
import { LookupsScreen } from "@/features/lookups/screens/LookupsScreen";

export const metadata: Metadata = { title: "الأنواع والأيقونات" };

export default function LookupsPage() {
  return (
    <PermissionGate permission="manage-lookups">
      {/* The screen reads ?tab= from the URL */}
      <Suspense>
        <LookupsScreen />
      </Suspense>
    </PermissionGate>
  );
}
