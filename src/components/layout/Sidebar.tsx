"use client";

import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "@/components/ui";
import { findNavItem, navigation } from "@/config/navigation";
import { useOverview } from "@/features/overview/hooks";
import { useAdmin } from "@/lib/auth/admin-provider";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { railFade, railMotion, railRow } from "./rail";
import { UserMenu } from "./UserMenu";

type SidebarProps = {
  /** Icon rail (large screens only). The drawer on small screens is always expanded. */
  collapsed?: boolean;
  /** Called after a link is chosen (closes the drawer on small screens). */
  onNavigate?: () => void;
  /** The current path, from the Shell. */
  pathname: string;
};

/** The permission-filtered menu on the brand column. An item the role cannot use is not rendered at all. */
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
      <div className="px-3">
        <div
          className={cn(
            "flex h-18 shrink-0 items-center gap-3 overflow-hidden border-b border-neutral-0/8 ps-1",
            railRow(collapsed),
          )}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-0 ring-4 ring-neutral-0/6">
            <Image src="/brand/wafa-logo.png" alt="" width={26} height={26} className="size-6.5" />
          </span>
          <span className={cn("flex shrink-0 flex-col gap-1 whitespace-nowrap", railFade(collapsed))}>
            <span className="text-lg leading-none font-black text-neutral-0">وفاء</span>
            <span className="text-xs leading-none text-sidebar-muted">لوحة الإدارة</span>
          </span>
        </div>
      </div>

      <nav
        aria-label="القائمة الرئيسية"
        className="flex min-h-0 flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto px-3 py-4 scrollbar-none"
      >
        {groups.map((group, index) => (
          <div key={group.title ?? index} className="flex flex-col gap-1">
            {/* The title and the rail's thin divider share one fixed-height slot, so nothing below moves */}
            {group.title && (
              <div className="relative h-6 shrink-0">
                <p
                  className={cn(
                    "px-3 text-[11.5px] leading-5 font-bold tracking-wide whitespace-nowrap text-sidebar-muted",
                    railFade(collapsed),
                  )}
                >
                  {group.title}
                </p>
                <span
                  aria-hidden
                  className={cn("absolute top-2.5 start-2 h-px w-8 bg-neutral-0/8", railFade(collapsed, true))}
                />
              </div>
            )}

            {group.items.map(({ href, label, icon: ItemIcon, count }) => {
              const active = href === activeHref;
              const badge = count ? (alerts?.[count] ?? 0) : 0;
              return (
                // Always wrapped (disabled while the label shows), so folding never remounts the link and keeps focus
                <Tooltip
                  key={href}
                  content={badge > 0 ? `${label} (${formatNumber(badge)})` : label}
                  side="inline-end"
                  disabled={!collapsed}
                >
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group/item relative flex h-11 items-center gap-3 overflow-hidden rounded-xl ps-3.5 pe-3 text-[14.5px] outline-none lg:h-10.5",
                      "transition-[width,background-color,color]",
                      railMotion,
                      collapsed ? "w-12" : "w-full",
                      "focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                      // The active page is the one amber surface of the sidebar: ink text and icon on it
                      active ? "bg-amber font-bold text-ink" : "font-medium hover:bg-sidebar-hover hover:text-neutral-0",
                    )}
                  >
                    <span className="relative shrink-0">
                      <ItemIcon
                        aria-hidden
                        weight={active ? "fill" : "regular"}
                        className={cn(
                          "size-5 transition-colors",
                          active ? "text-ink" : "text-sidebar-muted group-hover/item:text-neutral-0",
                        )}
                      />
                      {badge > 0 && (
                        <span
                          aria-hidden
                          className={cn(
                            "absolute -top-1 -end-1 size-2 rounded-full ring-2",
                            active ? "bg-ink ring-amber" : "bg-amber ring-sidebar",
                            railFade(collapsed, true),
                          )}
                        />
                      )}
                    </span>
                    <span className={cn("shrink-0 whitespace-nowrap", railFade(collapsed))}>{label}</span>
                    {badge > 0 && (
                      <span
                        className={cn(
                          "ms-auto flex h-5.5 min-w-5.5 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums",
                          active ? "bg-ink text-neutral-0" : "bg-amber text-ink",
                          railFade(collapsed),
                        )}
                      >
                        {formatNumber(badge)}
                      </span>
                    )}
                  </Link>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 px-3">
        <div className={cn("border-t border-neutral-0/8 py-3", railRow(collapsed))}>
          <UserMenu collapsed={collapsed} />
        </div>
      </div>
    </div>
  );
}
