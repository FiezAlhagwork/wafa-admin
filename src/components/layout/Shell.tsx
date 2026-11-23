"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CaretLeft, List, SidebarSimple } from "@phosphor-icons/react";
import { Drawer, IconButton, Tooltip } from "@/components/ui";
import { findNavGroupItem } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { Sidebar } from "./Sidebar";

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
type ShellProps = {
  children: ReactNode;
  /** Stands in for the URL (the dev preview, which lives at /dev/shell, marks the page it shows). */
  pathname?: string;
};

export function Shell({ children, pathname: pathnameOverride }: ShellProps) {
  const urlPathname = usePathname();
  const pathname = pathnameOverride ?? urlPathname;
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
  const current = findNavGroupItem(pathname);

  return (
    // Large screens: the window never scrolls, the content column does. So the page's scrollbar sits inside the
    // content (on its far side), never as a light strip beside the dark sidebar. Small screens keep the window
    // scroll (the mobile address bar collapses with it).
    <div className="min-h-dvh lg:flex lg:h-dvh lg:overflow-hidden">
      <aside
        className={cn(
          "z-30 hidden shrink-0 lg:block",
          "transition-[width] duration-200 ease-out motion-reduce:transition-none",
          collapsed ? "w-18" : "w-66",
        )}
      >
        <Sidebar collapsed={collapsed} pathname={pathname} />
      </aside>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen} label="القائمة الرئيسية" className="bg-sidebar">
        <Sidebar pathname={pathname} onNavigate={() => setMenuOpen(false)} />
      </Drawer>

      <div className="flex min-h-dvh flex-col lg:min-h-0 lg:min-w-0 lg:flex-1 lg:overflow-y-auto">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-ink/7 bg-bg/85 px-4 backdrop-blur-md sm:px-6 lg:px-10">
          <IconButton
            label="فتح القائمة"
            icon={<List className="size-5.5" />}
            variant="secondary"
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
          />
          <Tooltip content={`${toggleLabel} (Ctrl+B)`} side="bottom">
            <IconButton
              label={toggleLabel}
              aria-expanded={!collapsed}
              icon={<SidebarSimple className="size-5 rtl:-scale-x-100" />}
              className="hidden text-fg-muted lg:inline-flex"
              onClick={() => setCollapsed((value) => !value)}
            />
          </Tooltip>
          {current && (
            <nav aria-label="المسار" className="flex min-w-0 items-center gap-2 text-sm">
              {current.group && (
                <>
                  <span className="hidden text-fg-muted sm:inline">{current.group}</span>
                  <CaretLeft aria-hidden className="hidden size-3.5 text-fg-subtle sm:inline" />
                </>
              )}
              <span className="truncate font-bold text-fg">{current.label}</span>
            </nav>
          )}
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
