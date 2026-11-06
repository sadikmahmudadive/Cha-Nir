"use client";

import { useEffect, useState, memo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
} from "lucide-react";
import { useAdminAuth, ROLE_LABELS, ROLE_COLORS } from "@/lib/firebase/admin-auth";
import { useAdminTheme } from "@/lib/theme/admin-theme";

// Memoized leaf clock component to isolate 1-second state updates from re-rendering the header
const DhakaClock = memo(function DhakaClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Dhaka",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex items-center gap-2 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#161d15] px-3 py-1.5 text-xs font-mono font-semibold text-brown-soft dark:text-[#98a793] shadow-2xs">
      <Clock className="size-3.5 text-leaf dark:text-lime" />
      <span>{time || "12:00:00 PM"}</span>
      <span className="text-[0.65rem] font-sans font-bold text-leaf dark:text-lime-soft bg-leaf-soft/60 dark:bg-leaf/30 px-1.5 py-0.2 rounded">
        BST
      </span>
    </div>
  );
});

export function AdminHeader({
  onOpenMobileSidebar,
  onOpenNewOrder,
  onOpenNewLot,
  onOpenSearch,
}: {
  onOpenMobileSidebar: () => void;
  onOpenNewOrder?: () => void;
  onOpenNewLot?: () => void;
  onOpenSearch?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const { resolvedTheme, toggleTheme } = useAdminTheme();

  const getPageInfo = () => {
    if (pathname === "/admin") {
      return {
        crumb: "Overview",
        title: "Executive Overview",
        subtitle: "Real-time dispatch, inventory movement & operational metrics",
      };
    }
    if (pathname.startsWith("/admin/products")) {
      return {
        crumb: "Catalog & Products",
        title: "Storefront Products Catalog",
        subtitle: "Manage tea retail items, packaging sizes, badges & price tiers",
      };
    }
    if (pathname.startsWith("/admin/customers")) {
      return {
        crumb: "Buyers Directory",
        title: "Customer & Buyer Accounts",
        subtitle: "Retail consumers and commercial B2B clients directory",
      };
    }
    if (pathname.startsWith("/admin/storefront")) {
      return {
        crumb: "Storefront CMS",
        title: "Storefront CMS & Settings",
        subtitle: "Delivery thresholds, homepage curation, ticker marquee & contact",
      };
    }
    if (pathname.startsWith("/admin/orders")) {
      return {
        crumb: "Order Management (OMS)",
        title: "Order Management System",
        subtitle: "Process customer orders, print packing slips & dispatch couriers",
      };
    }
    if (pathname.startsWith("/admin/inventory")) {
      return {
        crumb: "Stock & Raw Lots (WMS)",
        title: "Warehouse Stock & Tea Lots",
        subtitle: "Finished goods SKUs, packaging materials & garden auction lots",
      };
    }
    if (pathname.startsWith("/admin/wholesale")) {
      return {
        crumb: "Wholesale CRM",
        title: "Wholesale B2B Deal Flow",
        subtitle: "Inbound quote requests, commercial buyers & negotiation pipeline",
      };
    }
    if (pathname.startsWith("/admin/finance")) {
      return {
        crumb: "Finance & COD",
        title: "COD & Financial Ledger",
        subtitle: "Steadfast & Pathao COD reconciliation, expenses & profit",
      };
    }
    if (pathname.startsWith("/admin/team")) {
      return {
        crumb: "Team & Access Control",
        title: "Admin Accounts & RBAC Roles",
        subtitle: "Firestore user permissions, role assignment & platform credentials",
      };
    }
    return {
      crumb: "Admin Portal",
      title: "Admin & Operations OS",
      subtitle: "Central enterprise management system",
    };
  };

  const info = getPageInfo();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-black/[0.06] dark:border-white/[0.07] bg-white/80 dark:bg-[#111611]/85 px-4 sm:px-8 backdrop-blur-md transition-colors duration-200">
      {/* Left: Mobile Toggle & Breadcrumbs / Titles */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden rounded-xl p-2 text-brown-soft dark:text-[#98a793] hover:bg-cream dark:hover:bg-white/[0.06] hover:text-brown dark:hover:text-[#f4f7f2] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0">
          {/* Breadcrumb Trail */}
          <nav className="hidden sm:flex items-center gap-1.5 text-[0.7rem] font-semibold text-brown-soft/80 dark:text-[#8b9a86] mb-0.5">
            <Link href="/admin" className="hover:text-leaf dark:hover:text-lime-soft transition-colors">
              Cha Nir
            </Link>
            <ChevronRight className="size-3 text-brown-soft/40 dark:text-[#8b9a86]/50" />
            <span className="text-leaf-deep dark:text-lime-soft font-bold">{info.crumb}</span>
          </nav>

          <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-brown dark:text-[#f4f7f2] truncate">
            {info.title}
          </h1>
        </div>
      </div>

      {/* Right: Quick Search Button + Clock + Theme Switcher + Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Global Quick Search Button */}
        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-cream/40 dark:bg-white/[0.04] hover:bg-cream/80 dark:hover:bg-white/[0.08] px-3 py-1.5 text-xs text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] transition-all shadow-2xs group"
            title="Quick search (⌘K or Ctrl+K)"
          >
            <Search className="size-3.5 text-brown-soft dark:text-[#98a793] group-hover:text-leaf dark:group-hover:text-lime transition-colors" />
            <span className="hidden md:inline font-medium text-[0.75rem]">Quick search...</span>
            <kbd className="hidden sm:inline-flex items-center rounded border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#1a2219] px-1.5 py-0.2 font-mono text-[0.62rem] text-brown-soft/80 dark:text-[#98a793] shadow-2xs">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Live Dhaka BST Clock (Isolated re-render) */}
        <DhakaClock />

        {/* Theme Switcher Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex size-9 items-center justify-center rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#161d15] text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] hover:bg-cream dark:hover:bg-white/[0.06] transition-all shadow-2xs group shrink-0"
          title={`Active theme: ${resolvedTheme === "dark" ? "Dark Mode (click to switch to Light)" : "Light Mode (click to switch to Dark)"}`}
          aria-label="Toggle theme mode"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="size-4 text-amber-400 group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="size-4 text-leaf group-hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* User Role Badge */}
        {user?.role && (
          <Link
            href="/admin/team"
            className={`hidden xl:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-bold border hover:opacity-90 transition-opacity ${
              ROLE_COLORS[user.role].badge
            }`}
            title="View team role & permissions"
          >
            <span className={`size-1.5 rounded-full ${ROLE_COLORS[user.role].dot}`} />
            <span>{ROLE_LABELS[user.role]}</span>
          </Link>
        )}

        {/* Quick Action: New Order */}
        {onOpenNewOrder && (
          <button
            type="button"
            onClick={onOpenNewOrder}
            className="btn btn-leaf text-xs font-bold px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-xs transition-all hover:shadow-md"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">New Order</span>
          </button>
        )}

        {/* Quick Action: Raw Lot */}
        {onOpenNewLot && (
          <button
            type="button"
            onClick={onOpenNewLot}
            className="btn btn-ghost text-xs font-bold px-3 py-2 sm:px-4 sm:py-2 rounded-xl border border-black/[0.12] dark:border-white/[0.12] hover:border-leaf dark:hover:border-leaf bg-white dark:bg-[#161d15] text-brown dark:text-[#f4f7f2]"
          >
            <Plus className="size-4 text-leaf dark:text-lime" />
            <span className="hidden sm:inline">Add Tea Lot</span>
          </button>
        )}
      </div>
    </header>
  );
}
