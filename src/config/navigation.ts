import {
  ChartLineUp,
  ClipboardText,
  CreditCard,
  Gear,
  House,
  Package,
  Shapes,
  ShieldCheck,
  Storefront,
  UserMinus,
  Users,
  type Icon,
} from "@phosphor-icons/react";
import type { AdminPermission } from "@/lib/api/types";

export type NavItem = {
  href: string;
  label: string;
  icon: Icon;
  /** Missing = every role (the home page). The sidebar hides the item without it; the screen checks again. */
  permission?: AdminPermission;
};

export type NavGroup = {
  /** No title for the first group (home). */
  title?: string;
  items: NavItem[];
};

export const navigation: NavGroup[] = [
  {
    items: [{ href: "/admin", label: "الرئيسية", icon: House }],
  },
  {
    title: "العمليات",
    items: [
      { href: "/admin/payments", label: "الدفعات", icon: CreditCard, permission: "review-payments" },
      { href: "/admin/merchants", label: "التجار", icon: Storefront, permission: "view-merchants-and-customers" },
      { href: "/admin/customers", label: "الزبائن", icon: Users, permission: "view-merchants-and-customers" },
      { href: "/admin/deletion-requests", label: "طلبات الحذف", icon: UserMinus, permission: "execute-deletion-requests" },
    ],
  },
  {
    title: "الإعدادات",
    items: [
      { href: "/admin/packages", label: "الباقات والأسعار", icon: Package, permission: "manage-packages" },
      { href: "/admin/settings", label: "إعدادات المنصة", icon: Gear, permission: "manage-settings" },
      { href: "/admin/lookups", label: "الأنواع والأيقونات", icon: Shapes, permission: "manage-lookups" },
    ],
  },
  {
    title: "الإدارة",
    items: [
      { href: "/admin/finance", label: "المالية", icon: ChartLineUp, permission: "view-financials" },
      { href: "/admin/audit-logs", label: "سجل التدقيق", icon: ClipboardText, permission: "view-audit-log" },
      { href: "/admin/admin-users", label: "حسابات الإدارة", icon: ShieldCheck, permission: "manage-admin-accounts" },
    ],
  },
];

/** The item that owns this path (`/admin/merchants/12` belongs to "التجار"): the longest matching href wins. */
export function findNavItem(pathname: string): NavItem | undefined {
  return navigation
    .flatMap((group) => group.items)
    .filter(({ href }) => (href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
