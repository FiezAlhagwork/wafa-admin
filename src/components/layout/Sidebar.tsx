"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { focusRing, Tooltip } from "@/components/ui";
import { findNavItem, navigation } from "@/config/navigation";
import { useAdmin } from "@/lib/auth/admin-provider";
import { cn } from "@/lib/cn";

type SidebarProps = {
  /** Icon rail (large screens only). The drawer on small screens is always expanded. */
  collapsed?: boolean;
  /** Called after a link is chosen (closes the drawer on small screens). */
  onNavigate?: () => void;
};

/** The permission-filtered menu. An item the role cannot use is not rendered at all. */
export function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  const { permissions } = useAdmin();
  const pathname = usePathname();
  const activeHref = findNavItem(pathname)?.href;

  const groups = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || permissions.includes(item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-12 shrink-0 items-center gap-2.5 border-b border-border px-4", collapsed && "justify-center px-0")}>
        <Image src="/brand/wafa-logo.png" alt="" width={24} height={24} className="size-6 shrink-0" />
        {!collapsed && <span className="truncate text-sm font-semibold text-fg">لوحة وفا</span>}
      </div>

      <nav aria-label="القائمة الرئيسية" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden p-2">
        {groups.map((group, index) => (
          <div key={group.title ?? index} className="flex flex-col gap-0.5">
            {/* Titles need room: on the rail they become a thin divider */}
            {group.title &&
              (collapsed ? (
                <span aria-hidden className="mx-2 mb-1 h-px bg-border" />
              ) : (
                <p className="px-2.5 pb-1 text-xs font-medium text-fg-muted">{group.title}</p>
              ))}

            {group.items.map(({ href, label, icon: ItemIcon }) => {
              const active = href === activeHref;
              const link = (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-10 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors lg:h-8",
                    collapsed && "justify-center px-0",
                    focusRing,
                    active ? "bg-neutral-100 font-medium text-fg" : "text-fg hover:bg-neutral-100/60",
                  )}
                >
                  {/* The amber indicator marks the active page */}
                  {active && <span aria-hidden className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-amber" />}
                  <ItemIcon aria-hidden className={cn("size-4.5 shrink-0", active ? "text-brand" : "text-fg-muted")} />
                  <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
                </Link>
              );

              return collapsed ? (
                <Tooltip key={href} content={label} side="inline-end">
                  {link}
                </Tooltip>
              ) : (
                link
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
