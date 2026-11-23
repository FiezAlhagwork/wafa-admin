import { notFound } from "next/navigation";
import { PermissionGate } from "@/components/layout/PermissionGate";
import { MerchantDetailScreen } from "@/features/merchants/screens/MerchantDetailScreen";

export default async function MerchantPage({ params }: PageProps<"/admin/merchants/[id]">) {
  const { id } = await params;
  const merchantId = Number(id);
  if (!Number.isInteger(merchantId) || merchantId <= 0) notFound();

  return (
    <PermissionGate permission="view-merchants-and-customers">
      <MerchantDetailScreen id={merchantId} />
    </PermissionGate>
  );
}
