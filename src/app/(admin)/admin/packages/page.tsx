import type { Metadata } from "next";
import { PermissionGate } from "@/components/layout/PermissionGate";
import { PackagesScreen } from "@/features/packages/screens/PackagesScreen";

export const metadata: Metadata = { title: "الباقات والأسعار" };

export default function PackagesPage() {
  return (
    <PermissionGate permission="manage-packages">
      <PackagesScreen />
    </PermissionGate>
  );
}
