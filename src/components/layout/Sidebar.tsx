"use client";

import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "@/components/ui";
import { findNavItem, navigation } from "@/config/navigation";
import { useOverview } from "@/features/overview/hooks";
import { useAdmin } from "@/lib/auth/admin-provider";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { UserMenu } from "./UserMenu";

type SidebarProps = {
  /** Icon rail (large screens only). The drawer on small screens is always expanded. */
  collapsed?: boolean;
  /** Called after a link is chosen (closes the drawer on small screens). */
  onNavigate?: () => void;
  /** The current path, from the Shell. */
  pathname: string;
};

/** The permission-filtered menu on the dark (ink) column. An item the role cannot use is not rendered at all. */
export function Sidebar({ collapsed = false, onNavigate, pathname }: SidebarProps) {
  const { permissions } = useAdmin();
  const activeHref = findNavItem(pathname)?.href;
  // The same query as the home page (shared cache): the badges are its alert counts
  const alerts = useOverview().data?.alerts;

  const groups = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || permissions.includes(item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-fg">
      <div
        className={cn(
          "mx-4 flex h-18 shrink-0 items-center gap-3 border-b border-neutral-0/8 px-1",
          collapsed && "mx-3 justify-center px-0",
        )}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-0 shadow-[0_0_0_4px_rgb(255_255_255/0.06)]">
          <Image src="/brand/wafa-logo.png" alt="" width={26} height={26} className="size-6.5" />
        </span>
        {!collapsed && (
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-lg leading-none font-black text-neutral-0">وفاء</span>
            <span className="text-xs leading-none text-sidebar-muted">لوحة الإدارة</span>
          </span>
        )}
      </div>

      <nav
        aria-label="القائمة الرئيسية"
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto px-3 py-4 scrollbar-none",
          collapsed && "px-2.5",
        )}
      >
        {groups.map((group, index) => (
          <div key={group.title ?? index} className="flex flex-col gap-1">
            {/* Titles need room: on the rail they become a thin divider */}
            {group.title &&
              (collapsed ? (
                <span aria-hidden className="mx-2 mb-1 h-px bg-neutral-0/8" />
              ) : (
                <p className="px-3 pb-1 text-[11.5px] font-bold tracking-wide text-sidebar-muted">{group.title}</p>
              ))}

            {group.items.map(({ href, label, icon: ItemIcon, count }) => {
              const active = href === activeHref;
              const badge = count ? (alerts?.[count] ?? 0) : 0;
              const link = (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group/item relative flex h-11 items-center gap-3 rounded-xl px-3 text-[14.5px] transition-colors outline-none lg:h-10.5",
                    "focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                    collapsed && "justify-center px-0",
                    // The active page is the one amber surface of the sidebar: ink text and icon on it
                    active
                      ? "bg-amber font-bold text-ink"
                      : "font-medium hover:bg-sidebar-hover hover:text-neutral-0",
                  )}
                >
                  <ItemIcon
                    aria-hidden
                    weight={active ? "fill" : "regular"}
                    className={cn(
                      "size-5 shrink-0 transition-colors",
                      active ? "text-ink" : "text-sidebar-muted group-hover/item:text-neutral-0",
                    )}
                  />
                  <span className={cn("flex-1 truncate", collapsed && "sr-only")}>{label}</span>
                  {badge > 0 &&
                    (collapsed ? (
                      <span
                        aria-hidden
                        className={cn(
                          "absolute top-1.5 end-1.5 size-2 rounded-full ring-2",
                          active ? "bg-ink ring-amber" : "bg-amber ring-sidebar",
                        )}
                      />
                    ) : (
                      <span
                        className={cn(
                          "flex h-5.5 min-w-5.5 items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums",
                          active ? "bg-ink text-neutral-0" : "bg-amber text-ink",
                        )}
                      >
                        {formatNumber(badge)}
                      </span>
                    ))}
                </Link>
              );

              return collapsed ? (
                <Tooltip key={href} content={badge > 0 ? `${label} (${formatNumber(badge)})` : label} side="inline-end">
                  {link}
                </Tooltip>
              ) : (
                link
              );
            })}
          </div>
        ))}
      </nav>

      <div className={cn("mx-3 shrink-0 border-t border-neutral-0/8 py-3", collapsed && "mx-2.5")}>
        <UserMenu collapsed={collapsed} />
      </div>
    </div>
  );
}
