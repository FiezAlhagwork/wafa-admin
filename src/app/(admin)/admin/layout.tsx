import { AdminProvider } from "@/lib/auth/admin-provider";

// The Shell (sidebar + header) wraps children here in step 4.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProvider>{children}</AdminProvider>;
}
