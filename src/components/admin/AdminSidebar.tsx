"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Briefcase,
  Coffee,
  DollarSign,
  ExternalLink,
  Globe,
  Package,
  RotateCcw,
  Search,
  Sparkles,
  Store,
  Users,
  X,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { erpActions, useErpStore } from "@/lib/erp/erp-store";
import { useAdminAuth, ROLE_LABELS } from "@/lib/firebase/admin-auth";
import { useState } from "react";

const STOREFRONT_NAV = [
  {
    href: "/admin",
    label: "Executive Overview",
    icon: BarChart3,
    exact: true,
  },
  {
    href: "/admin/products",
    label: "Products Catalog",
    icon: Coffee,
    badgeKey: "totalProductsCount",
  },
  {
    href: "/admin/customers",
    label: "Customers Directory",
    icon: Users,
    badgeKey: "totalCustomersCount",
  },
  {
    href: "/admin/storefront",
    label: "Storefront CMS & Settings",
    icon: Globe,
  },
];

const ERP_NAV = [
  {
    href: "/admin/orders",
    label: "Order Management (OMS)",
    icon: Package,
    badgeKey: "pendingOrdersCount",
  },
  {
    href: "/admin/inventory",
    label: "Stock & Tea Lots (WMS)",
    icon: Boxes,
    badgeKey: "lowStockCount",
  },
  {
    href: "/admin/wholesale",
    label: "Wholesale B2B CRM",
    icon: Briefcase,
    badgeKey: "newLeadsCount",
  },
  {
    href: "/admin/finance",
    label: "COD & Financials",
    icon: DollarSign,
  },
];

const PLATFORM_NAV = [
  {
    href: "/admin/team",
    label: "Team & Role RBAC",
    icon: ShieldCheck,
  },
];

export function AdminSidebar({
  mobileOpen,
  onCloseMobile,
  onOpenSearch,
}: {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenSearch?: () => void;
}) {
  const pathname = usePathname();
  const { metrics } = useErpStore();
  const { user, logout } = useAdminAuth();
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    if (confirm("Reset ERP & Admin database to default seed records?")) {
      setResetting(true);
      erpActions.resetDemoData();
      setTimeout(() => setResetting(false), 500);
    }
  };

  const renderNavGroup = (title: string, items: typeof STOREFRONT_NAV) => (
    <div className="space-y-1">
      <p className="px-3 text-[0.65rem] font-bold uppercase tracking-wider text-brown-soft/70 dark:text-[#7d8b78]">
        {title}
      </p>
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        const badgeKey = item.badgeKey as keyof typeof metrics | undefined;
        const badgeValue = badgeKey ? metrics[badgeKey] : null;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onCloseMobile}
            className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-[0.85rem] font-semibold transition-all duration-150 ${
              active
                ? "bg-leaf text-cream dark:bg-leaf dark:text-[#f4f7f2] shadow-xs font-bold"
                : "text-brown-soft dark:text-[#98a793] hover:bg-cream-2/70 dark:hover:bg-white/[0.06] hover:text-brown dark:hover:text-[#f4f7f2]"
            }`}
          >
            {/* Active Pill Left Indicator Bar */}
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-lime" />
            )}

            <div className="flex items-center gap-2.5">
              <Icon
                className={`size-4 transition-colors ${
                  active ? "text-lime" : "text-brown-soft/80 dark:text-[#98a793] group-hover:text-brown dark:group-hover:text-[#f4f7f2]"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </div>

            {badgeValue !== null && badgeValue > 0 && (
              <span
                className={`rounded-full px-2 py-0.2 text-[0.68rem] font-bold font-mono tracking-wide ${
                  active
                    ? "bg-cream dark:bg-lime/20 text-leaf-deep dark:text-lime-soft shadow-2xs"
                    : "bg-lime/40 dark:bg-lime/20 text-leaf-deep dark:text-lime-soft border border-lime/30"
                }`}
              >
                {badgeValue}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  const content = (
    <div className="flex h-full flex-col justify-between border-r border-black/[0.07] dark:border-white/[0.08] bg-[#fffdfa] dark:bg-[#111611] px-3.5 py-5 text-brown dark:text-[#f4f7f2] overflow-y-auto">
      {/* Brand Header & Navigation */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.07]">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="relative flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-leaf to-leaf-deep text-cream font-bold text-base shadow-sm ring-1 ring-leaf/20 shrink-0 group-hover:scale-105 transition-transform">
              <span>CN</span>
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-lime border-2 border-white dark:border-[#111611]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-bold tracking-tight text-brown dark:text-[#f4f7f2]">
                  Cha Nir
                </span>
                <span className="rounded bg-leaf-soft/70 dark:bg-leaf/25 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-leaf-deep dark:text-lime-soft border border-leaf/20 dark:border-leaf/35">
                  Admin OS
                </span>
              </div>
              <p className="text-[0.67rem] text-brown-soft dark:text-[#98a793] flex items-center gap-1">
                <Sparkles className="size-2.5 text-leaf dark:text-lime" />
                <span>Storefront & ERP Suite</span>
              </p>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden rounded-lg p-1.5 text-brown-soft dark:text-[#98a793] hover:bg-cream dark:hover:bg-white/[0.06] hover:text-brown dark:hover:text-[#f4f7f2]"
              aria-label="Close sidebar"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Quick Search Trigger Pill */}
        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            className="mt-3.5 flex w-full items-center justify-between rounded-xl border border-black/[0.07] dark:border-white/[0.08] bg-cream/40 dark:bg-white/[0.04] hover:bg-cream/80 dark:hover:bg-white/[0.08] px-3 py-2 text-xs text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] transition-all shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <Search className="size-3.5 text-leaf dark:text-lime" />
              <span className="font-medium text-[0.78rem]">Search anywhere...</span>
            </div>
            <kbd className="inline-flex items-center rounded border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#1a2219] px-1.5 py-0.2 font-mono text-[0.62rem] text-brown-soft dark:text-[#98a793] shadow-2xs">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Live Sylhet Hub Status Pill */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-cream/60 dark:bg-[#161d15] border border-black/[0.05] dark:border-white/[0.06] p-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold text-leaf-deep dark:text-lime-soft text-[0.72rem]">Sylhet Hub Active</span>
          </div>
          <span className="font-mono text-[0.68rem] text-brown-soft/80 dark:text-[#98a793]">BST (GMT+6)</span>
        </div>

        {/* Navigation Sections */}
        <nav className="mt-5 space-y-5" aria-label="Admin & ERP Navigation">
          {renderNavGroup("Storefront Admin", STOREFRONT_NAV)}
          {renderNavGroup("Operations & ERP", ERP_NAV)}
          {renderNavGroup("Access & Governance", PLATFORM_NAV)}
        </nav>
      </div>

      {/* Footer controls & Profile */}
      <div className="space-y-2.5 pt-5 border-t border-black/[0.06] dark:border-white/[0.07] mt-6">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-xl border border-black/[0.07] dark:border-white/[0.08] bg-white dark:bg-[#161d15] px-3 py-2 text-xs font-semibold text-brown dark:text-[#f4f7f2] hover:bg-cream/70 dark:hover:bg-white/[0.06] hover:border-leaf/30 transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <Store className="size-3.5 text-leaf dark:text-lime group-hover:scale-110 transition-transform" />
            <span>Storefront Public View</span>
          </div>
          <ExternalLink className="size-3 text-brown-soft dark:text-[#98a793] group-hover:text-leaf dark:group-hover:text-lime transition-colors" />
        </Link>

        <button
          type="button"
          onClick={handleReset}
          disabled={resetting}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-transparent px-3 py-1.5 text-[0.72rem] font-semibold text-brown-soft dark:text-[#98a793] hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-400 transition-colors"
        >
          <RotateCcw className={`size-3 ${resetting ? "animate-spin" : ""}`} />
          <span>Reset Demo Data</span>
        </button>

        {/* Dynamic Authenticated User Profile */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8.5 rounded-full bg-linear-to-br from-leaf-soft to-lime/40 dark:from-leaf/30 dark:to-lime/20 border border-leaf/20 dark:border-leaf/35 flex items-center justify-center font-bold text-leaf-deep dark:text-lime-soft text-xs shrink-0 shadow-2xs">
              {user?.displayName
                ? user.displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "SA"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-brown dark:text-[#f4f7f2]">
                {user?.displayName || "Super Admin"}
              </p>
              <p className="truncate text-[0.62rem] font-bold text-leaf-deep dark:text-lime-soft">
                {user?.role ? ROLE_LABELS[user.role] : "Super Admin"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm("Sign out of Cha Nir Admin OS?")) {
                logout();
              }
            }}
            className="rounded-lg p-1.5 text-brown-soft dark:text-[#98a793] hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile Slide-over Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
