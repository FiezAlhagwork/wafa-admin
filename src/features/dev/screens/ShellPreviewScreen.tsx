"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { PermissionGate } from "@/components/layout/PermissionGate";
import { Shell } from "@/components/layout/Shell";
import { AdminUsersScreen } from "@/features/admin-users/screens/AdminUsersScreen";
import { CustomerDetailScreen } from "@/features/customers/screens/CustomerDetailScreen";
import { CustomersScreen } from "@/features/customers/screens/CustomersScreen";
import { MerchantDetailScreen } from "@/features/merchants/screens/MerchantDetailScreen";
import { MerchantsScreen } from "@/features/merchants/screens/MerchantsScreen";
import { OverviewScreen } from "@/features/overview/screens/OverviewScreen";
import { PackagesScreen } from "@/features/packages/screens/PackagesScreen";
import { PaymentsScreen } from "@/features/payments/screens/PaymentsScreen";
import type { AdminPermission, AdminRole, AdminUser } from "@/lib/api/types";
import { AdminContext } from "@/lib/auth/admin-provider";
import { createQueryClient } from "@/lib/query-client";
import { createMockApi, getMockFaults, setMockFault, subscribeMockFaults, type MockScenario } from "../mock-api";

type Page = "overview" | "payments" | "merchants" | "customers" | "packages" | "admin-users";

const pages: { id: Page; label: string; path: string }[] = [
  { id: "overview", label: "الرئيسية", path: "/admin" },
  { id: "payments", label: "الدفعات", path: "/admin/payments" },
  { id: "merchants", label: "التجار", path: "/admin/merchants" },
  { id: "customers", label: "الزبائن", path: "/admin/customers" },
  { id: "packages", label: "الباقات", path: "/admin/packages" },
  { id: "admin-users", label: "الحسابات", path: "/admin/admin-users" },
];

// The permissions of each role, copied from the backend guide's table (§5). A scenario is a role, so the preview shows
// exactly what that person would see. `loading` and `error` have every permission: they test the screens, not the roles.
const permissionsByRole: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    "manage-admin-accounts",
    "cancel-stamps",
    "manage-packages",
    "manage-settings",
    "grant-extensions",
    "view-audit-log",
    "view-merchants-and-customers",
    "edit-business-identity",
    "suspend-merchants",
    "edit-customer-birthdate",
    "reveal-customer-phone",
    "manage-lookups",
    "execute-deletion-requests",
    "view-financials",
  ],
  admin: [
    "cancel-stamps",
    "view-merchants-and-customers",
    "edit-business-identity",
    "suspend-merchants",
    "edit-customer-birthdate",
    "reveal-customer-phone",
    "manage-lookups",
    "execute-deletion-requests",
  ],
  payments_reviewer: ["review-payments", "view-financials"],
  support: [
    "view-merchants-and-customers",
    "edit-business-identity",
    "edit-customer-birthdate",
    "reveal-customer-phone",
  ],
};

const everyPermission: AdminPermission[] = [...new Set(Object.values(permissionsByRole).flat())];

type ScenarioInfo = { id: MockScenario; label: string; role: AdminRole; userId: number; name: string };

const scenarios: ScenarioInfo[] = [
  { id: "super_admin", label: "مدير عام", role: "super_admin", userId: 1, name: "سامر الحلبي" },
  { id: "admin", label: "مدير", role: "admin", userId: 4, name: "هالة المدير" },
  { id: "reviewer", label: "مراجع دفعات", role: "payments_reviewer", userId: 2, name: "ليلى المراجعة" },
  { id: "support", label: "دعم", role: "support", userId: 3, name: "كريم الدعم" },
  { id: "loading", label: "تحميل", role: "super_admin", userId: 1, name: "سامر الحلبي" },
  { id: "error", label: "خطأ", role: "super_admin", userId: 1, name: "سامر الحلبي" },
];

const subscribe = () => () => {};

/**
 * The Shell with the real screens, talking to a fake backend (see mock-api.ts), so the design can be checked without
 * Clerk or the real API. The Shell reads localStorage, so it only renders after hydration.
 */
export function ShellPreviewScreen() {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  const [scenario, setScenario] = useState<ScenarioInfo>(scenarios[0]);
  const [page, setPage] = useState<Page>("overview");

  if (!isClient) return null;

  return (
    <>
      <PreviewApp key={scenario.id} scenario={scenario} page={page} />
      <div className="fixed end-4 bottom-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col gap-1 rounded-xl border border-border bg-surface p-1.5 shadow-popup">
        <div className="flex flex-wrap gap-1">
          {pages.map(({ id, label }) => (
            <Button key={id} size="sm" variant={id === page ? "accent" : "ghost"} onClick={() => setPage(id)}>
              {label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {scenarios.map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant={item.id === scenario.id ? "primary" : "ghost"}
              onClick={() => setScenario(item)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <FaultControls />
      </div>
    </>
  );
}

/** Causes the failures the fixtures never reach (403/429 on the next write, a failing "load more"). */
function FaultControls() {
  const faults = useSyncExternalStore(subscribeMockFaults, getMockFaults, getMockFaults);
  const toggleNext = (next: "forbidden" | "rate-limited") =>
    setMockFault({ next: faults.next === next ? null : next });

  return (
    <div className="flex flex-wrap items-center gap-1 border-t border-border pt-1">
      <span className="px-2 text-xs text-fg-muted">أعطال</span>
      <Button size="sm" variant={faults.next === "forbidden" ? "danger" : "ghost"} onClick={() => toggleNext("forbidden")}>
        403 للعملية الجاية
      </Button>
      <Button
        size="sm"
        variant={faults.next === "rate-limited" ? "danger" : "ghost"}
        onClick={() => toggleNext("rate-limited")}
      >
        429 للعملية الجاية
      </Button>
      <Button
        size="sm"
        variant={faults.failNextPage ? "danger" : "ghost"}
        aria-pressed={faults.failNextPage}
        onClick={() => setMockFault({ failNextPage: !faults.failNextPage })}
      >
        فشل تحميل المزيد
      </Button>
    </div>
  );
}

function PreviewApp({ scenario, page }: { scenario: ScenarioInfo; page: Page }) {
  // The dashboard's own client (its shared 403/429 toasts included), without retries and focus refetches
  const [client] = useState(() => {
    const queryClient = createQueryClient();
    const defaults = queryClient.getDefaultOptions();
    queryClient.setDefaultOptions({
      ...defaults,
      queries: { ...defaults.queries, retry: false, refetchOnWindowFocus: false },
    });
    return queryClient;
  });
  const [mock] = useState(() => createMockApi(scenario.id));

  // Active before the first child effect fires its requests; the effect re-activates after StrictMode's fake unmount
  mock.activate();
  useEffect(() => {
    mock.activate();
    return () => mock.deactivate();
  }, [mock]);

  const permissions =
    scenario.id === "loading" || scenario.id === "error" ? everyPermission : permissionsByRole[scenario.role];
  const user: AdminUser = {
    id: scenario.userId,
    name: scenario.name,
    email: "preview@example.com",
    role: scenario.role,
    is_active: true,
    linked: true,
    last_login_at: null,
  };

  return (
    <QueryClientProvider client={client}>
      <AdminContext value={{ user, permissions }}>
        <Shell pathname={pages.find((item) => item.id === page)?.path}>
          {/* Keyed by page: coming back to the merchants starts at the list, not at the last opened merchant */}
          <PreviewPage key={page} page={page} />
        </Shell>
      </AdminContext>
    </QueryClientProvider>
  );
}

/** Each screen sits behind the same permission gate as its real route, so a role test behaves like the real thing. */
function PreviewPage({ page }: { page: Page }) {
  // The merchant list opens a merchant inside the preview (the real route navigates, which would leave /dev/shell)
  const [merchantId, setMerchantId] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);

  switch (page) {
    case "overview":
      return <OverviewScreen />;
    case "payments":
      return (
        <PermissionGate permission="review-payments">
          <PaymentsScreen />
        </PermissionGate>
      );
    case "merchants":
      return (
        <PermissionGate permission="view-merchants-and-customers">
          {merchantId === null ? (
            <MerchantsScreen onOpen={setMerchantId} />
          ) : (
            <MerchantDetailScreen id={merchantId} onBack={() => setMerchantId(null)} />
          )}
        </PermissionGate>
      );
    case "customers":
      return (
        <PermissionGate permission="view-merchants-and-customers">
          {customerId === null ? (
            <CustomersScreen onOpen={setCustomerId} />
          ) : (
            <CustomerDetailScreen id={customerId} onBack={() => setCustomerId(null)} />
          )}
        </PermissionGate>
      );
    case "packages":
      return (
        <PermissionGate permission="manage-packages">
          <PackagesScreen />
        </PermissionGate>
      );
    case "admin-users":
      return (
        <PermissionGate permission="manage-admin-accounts">
          <AdminUsersScreen />
        </PermissionGate>
      );
  }
}
