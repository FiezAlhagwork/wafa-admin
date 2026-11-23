import { Shell } from "@/components/layout/Shell";
import { AdminProvider } from "@/lib/auth/admin-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <Shell>{children}</Shell>
    </AdminProvider>
  );
}
