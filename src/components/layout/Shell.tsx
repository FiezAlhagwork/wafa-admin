"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { List, SidebarSimple } from "@phosphor-icons/react";
import { Drawer, IconButton, Tooltip } from "@/components/ui";
import { findNavItem } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";

const STORAGE_KEY = "wafa-admin:sidebar-collapsed";

// The Shell only renders after /admin/auth/me succeeded (AdminProvider), so it is never part of the server HTML
// and reading localStorage here cannot cause a hydration mismatch. Storage can throw (private window): default open.
function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * Sidebar + header + the page. Large screens: a fixed column that folds into an icon rail (Ctrl/⌘+B, remembered).
 * Small screens: a drawer. Under AdminProvider.
 */
export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      // Not remembered this time: the toggle still works
    }
  }, [collapsed]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "b" || isTypingTarget(event.target)) return;
      event.preventDefault();
      setCollapsed((current) => !current);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleLabel = collapsed ? "توسيع القائمة" : "طيّ القائمة";
  const pageTitle = findNavItem(pathname)?.label;

  return (
    <div
      className={cn(
        "min-h-dvh transition-[padding] duration-200 ease-out motion-reduce:transition-none",
        collapsed ? "lg:ps-16" : "lg:ps-60",
      )}
    >
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-30 hidden border-e border-border bg-bg lg:block",
          "transition-[width] duration-200 ease-out motion-reduce:transition-none",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <Sidebar collapsed={collapsed} />
      </aside>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen} label="القائمة الرئيسية">
        <Sidebar onNavigate={() => setMenuOpen(false)} />
      </Drawer>

      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-3 sm:px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <IconButton
              label="فتح القائمة"
              icon={<List className="size-5" />}
              size="sm"
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
            />
            <Tooltip content={`${toggleLabel} (Ctrl+B)`} side="bottom">
              <IconButton
                label={toggleLabel}
                aria-expanded={!collapsed}
                icon={<SidebarSimple className="size-5 rtl:-scale-x-100" />}
                size="sm"
                className="hidden lg:inline-flex"
                onClick={() => setCollapsed((current) => !current)}
              />
            </Tooltip>
            {pageTitle && <span className="truncate text-sm font-semibold text-fg">{pageTitle}</span>}
          </div>
          <UserMenu />
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
