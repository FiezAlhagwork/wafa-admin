"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { Shell } from "@/components/layout/Shell";
import { AdminUsersScreen } from "@/features/admin-users/screens/AdminUsersScreen";
import { OverviewScreen } from "@/features/overview/screens/OverviewScreen";
import { PaymentsScreen } from "@/features/payments/screens/PaymentsScreen";
import type { AdminPermission, AdminUser } from "@/lib/api/types";
import { AdminContext } from "@/lib/auth/admin-provider";
import { createMockApi, type MockScenario } from "../mock-api";

type Page = "overview" | "payments" | "admin-users";

const scenarios: { id: MockScenario; label: string }[] = [
  { id: "full", label: "كل الصلاحيات" },
  { id: "reviewer", label: "مراجع دفعات (بدون مالية)" },
  { id: "loading", label: "تحميل" },
  { id: "error", label: "خطأ" },
];

const pages: { id: Page; label: string }[] = [
  { id: "overview", label: "الرئيسية" },
  { id: "payments", label: "الدفعات" },
  { id: "admin-users", label: "الحسابات" },
];

const allPermissions: AdminPermission[] = [
  "manage-admin-accounts",
  "manage-packages",
  "manage-settings",
  "grant-extensions",
  "view-audit-log",
  "review-payments",
  "view-financials",
  "suspend-merchants",
  "execute-deletion-requests",
  "cancel-stamps",
  "manage-lookups",
  "edit-business-identity",
  "edit-customer-birthdate",
  "view-merchants-and-customers",
  "reveal-customer-phone",
];

const reviewerPermissions: AdminPermission[] = ["review-payments", "view-merchants-and-customers"];

const user: AdminUser = {
  id: 1,
  name: "سامر الحلبي",
  email: "samer@example.com",
  role: "super_admin",
  is_active: true,
  linked: true,
  last_login_at: null,
};

const screens: Record<Page, ReactNode> = {
  overview: <OverviewScreen />,
  payments: <PaymentsScreen />,
  "admin-users": <AdminUsersScreen />,
};

const subscribe = () => () => {};

/**
 * The Shell with the real screens, talking to a fake backend (see mock-api.ts), so the design can be checked without
 * Clerk or the real API. The Shell reads localStorage, so it only renders after hydration.
 */
export function ShellPreviewScreen() {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  const [scenario, setScenario] = useState<MockScenario>("full");
  const [page, setPage] = useState<Page>("overview");

  if (!isClient) return null;

  return (
    <>
      <PreviewApp key={scenario} scenario={scenario} page={page} />
      <div className="fixed end-4 bottom-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col gap-1 rounded-xl border border-border bg-surface p-1.5 shadow-popup">
        <div className="flex flex-wrap gap-1">
          {pages.map(({ id, label }) => (
            <Button key={id} size="sm" variant={id === page ? "accent" : "ghost"} onClick={() => setPage(id)}>
              {label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {scenarios.map(({ id, label }) => (
            <Button key={id} size="sm" variant={id === scenario ? "primary" : "ghost"} onClick={() => setScenario(id)}>
              {label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}

function PreviewApp({ scenario, page }: { scenario: MockScenario; page: Page }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } }),
  );
  const [mock] = useState(() => createMockApi(scenario));

  // Active before the first child effect fires its requests; the effect re-activates after StrictMode's fake unmount
  mock.activate();
  useEffect(() => {
    mock.activate();
    return () => mock.deactivate();
  }, [mock]);

  const permissions = scenario === "reviewer" ? reviewerPermissions : allPermissions;

  return (
    <QueryClientProvider client={client}>
      <AdminContext value={{ user, permissions }}>
        <Shell>{screens[page]}</Shell>
      </AdminContext>
    </QueryClientProvider>
  );
}
