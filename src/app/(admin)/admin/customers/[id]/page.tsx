import { notFound } from "next/navigation";
import { PermissionGate } from "@/components/layout/PermissionGate";
import { CustomerDetailScreen } from "@/features/customers/screens/CustomerDetailScreen";

export default async function CustomerPage({ params }: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  const customerId = Number(id);
  if (!Number.isInteger(customerId) || customerId <= 0) notFound();

  return (
    <PermissionGate permission="view-merchants-and-customers">
      <CustomerDetailScreen id={customerId} />
    </PermissionGate>
  );
}
