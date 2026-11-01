"use client";

import { SignOut } from "@phosphor-icons/react";
import { Badge, Button, Card, CardBody, CardHeader } from "@/components/ui";
import { useSignOut } from "@/features/auth/hooks";
import { useAdmin } from "@/lib/auth/admin-provider";

// Temporary: proves the auth round trip (Clerk → /admin/auth/me). Replaced by features/overview in step 5.
export default function AdminHomePage() {
  const { user, permissions } = useAdmin();
  const { signOut, pending } = useSignOut();

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <Card>
        <CardHeader
          title={`أهلاً ${user.name}`}
          description={
            <bdi dir="ltr" className="font-medium">
              {user.email}
            </bdi>
          }
          actions={
            <Button
              variant="secondary"
              size="sm"
              icon={<SignOut className="size-4 rtl:-scale-x-100" />}
              loading={pending}
              onClick={signOut}
            >
              تسجيل الخروج
            </Button>
          }
        />
        <CardBody className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-fg-muted">الدور:</span>
            <Badge tone="brand">{user.role}</Badge>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <span className="text-fg-muted">الصلاحيات ({permissions.length}):</span>
            <div className="flex flex-wrap gap-2" dir="ltr">
              {permissions.map((permission) => (
                <Badge key={permission}>{permission}</Badge>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
