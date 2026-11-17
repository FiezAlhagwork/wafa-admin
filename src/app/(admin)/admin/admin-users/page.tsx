import { PermissionGate } from "@/components/layout/PermissionGate";
import { AdminUsersScreen } from "@/features/admin-users/screens/AdminUsersScreen";

export default function AdminUsersPage() {
  return (
    <PermissionGate permission="manage-admin-accounts">
      <AdminUsersScreen />
    </PermissionGate>
  );
}
