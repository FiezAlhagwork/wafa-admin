import type { Metadata } from "next";
import { PermissionGate } from "@/components/layout/PermissionGate";
import { SettingsScreen } from "@/features/settings/screens/SettingsScreen";

export const metadata: Metadata = { title: "إعدادات المنصة" };

export default function SettingsPage() {
  return (
    <PermissionGate permission="manage-settings">
      <SettingsScreen />
    </PermissionGate>
  );
}
