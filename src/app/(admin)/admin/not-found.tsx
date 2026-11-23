import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { Card, EmptyState } from "@/components/ui";

/** `notFound()` in a dashboard page (a bad merchant or customer id): shown inside the shell, with the sidebar. */
export default function AdminNotFound() {
  return (
    <Card>
      <EmptyState
        icon={<MagnifyingGlass />}
        title="الصفحة غير موجودة"
        description="الرابط غير صحيح أو العنصر غير موجود."
        action={
          <Link href="/admin" className="text-sm font-bold text-brand hover:underline">
            العودة إلى الرئيسية
          </Link>
        }
      />
    </Card>
  );
}
