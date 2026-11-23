import { PermissionGate } from "@/components/layout/PermissionGate";
import { CustomersScreen } from "@/features/customers/screens/CustomersScreen";

export default function CustomersPage() {
  return (
    <PermissionGate permission="view-merchants-and-customers">
      <CustomersScreen />
    </PermissionGate>
  );
}
