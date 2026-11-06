"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Boxes,
  Briefcase,
  Coffee,
  DollarSign,
  Globe,
  Package,
  Search,
  Users,
  X,
  ArrowRight,
} from "lucide-react";
import { useErpStore } from "@/lib/erp/erp-store";
import { bdt } from "@/lib/pricing";

export function QuickSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { orders, products, customers, rawLots } = useErpStore();
  const [query, setQuery] = useState("");

  // Close on Escape or handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase().trim();

    const matchedProducts = products
      .filter((p) => p.name.toLowerCase().includes(q) || p.grade.toLowerCase().includes(q) || p.slug.includes(q))
      .slice(0, 4);

    const matchedOrders = orders
      .filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q) ||
          o.customer.city.toLowerCase().includes(q)
      )
      .slice(0, 4);

    const matchedCustomers = customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.buyerType.toLowerCase().includes(q)
      )
      .slice(0, 4);

    const matchedLots = rawLots
      .filter((l) => l.id.toLowerCase().includes(q) || l.garden.toLowerCase().includes(q) || l.grade.toLowerCase().includes(q))
      .slice(0, 3);

    return {
      products: matchedProducts,
      orders: matchedOrders,
      customers: matchedCustomers,
      lots: matchedLots,
    };
  }, [query, products, orders, customers, rawLots]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  const QUICK_PAGES = [
    { label: "Executive Dashboard", path: "/admin", icon: Boxes },
    { label: "Products & Teas Catalog", path: "/admin/products", icon: Coffee },
    { label: "Buyer Accounts Directory", path: "/admin/customers", icon: Users },
    { label: "Orders & Fulfillment (OMS)", path: "/admin/orders", icon: Package },
    { label: "Warehouse Stock & Lots (WMS)", path: "/admin/inventory", icon: Boxes },
    { label: "Wholesale B2B CRM", path: "/admin/wholesale", icon: Briefcase },
    { label: "COD & Financial Ledger", path: "/admin/finance", icon: DollarSign },
    { label: "Storefront CMS & Settings", path: "/admin/storefront", icon: Globe },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-line overflow-hidden text-brown"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line bg-cream/30">
          <Search className="size-5 text-leaf shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, teas, customers, tea lots, or jump to page..."
            className="flex-1 bg-transparent text-sm font-medium text-brown placeholder:text-brown-soft/60 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-brown-soft hover:bg-cream"
            >
              <X className="size-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-line bg-white px-2 py-0.5 text-[0.65rem] font-mono text-brown-soft">
            ESC
          </kbd>
        </div>

        {/* Results / Navigation Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs">
          {searchResults ? (
            <div className="space-y-4">
              {/* Products Results */}
              {searchResults.products.length > 0 && (
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brown-soft/80 mb-1.5 px-2">
                    Teas & Products
                  </p>
                  <div className="space-y-1">
                    {searchResults.products.map((p) => (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => navigateTo("/admin/products")}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-cream/50 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative size-8 rounded-lg overflow-hidden bg-cream border border-line shrink-0">
                            <Image src={p.image} alt={p.name} fill className="object-cover" sizes="32px" />
                          </div>
                          <div>
                            <p className="font-bold text-brown group-hover:text-leaf transition-colors">{p.name}</p>
                            <p className="text-[0.7rem] text-brown-soft">{p.grade} • {p.category}</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-leaf text-xs">
                          {bdt(p.variants[0]?.price || 0)}+
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Results */}
              {searchResults.orders.length > 0 && (
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brown-soft/80 mb-1.5 px-2">
                    Orders
                  </p>
                  <div className="space-y-1">
                    {searchResults.orders.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => navigateTo("/admin/orders")}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-cream/50 text-left transition-colors group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-leaf-deep">{o.id}</span>
                            <span className="rounded bg-cream-2 px-1.5 py-0.2 text-[0.65rem] font-semibold">
                              {o.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-brown font-semibold">{o.customer.name} ({o.customer.city})</p>
                        </div>
                        <span className="font-mono font-bold text-brown">{bdt(o.total)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers Results */}
              {searchResults.customers.length > 0 && (
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brown-soft/80 mb-1.5 px-2">
                    Customers & Buyers
                  </p>
                  <div className="space-y-1">
                    {searchResults.customers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => navigateTo("/admin/customers")}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-cream/50 text-left transition-colors group"
                      >
                        <div>
                          <p className="font-bold text-brown group-hover:text-leaf transition-colors">{c.name}</p>
                          <p className="text-[0.7rem] text-brown-soft font-mono">{c.phone} • {c.buyerType}</p>
                        </div>
                        <span className="text-[0.7rem] font-mono text-leaf font-bold">
                          {c.totalKg} kg ({bdt(c.totalSpent)})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tea Lots Results */}
              {searchResults.lots.length > 0 && (
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brown-soft/80 mb-1.5 px-2">
                    Garden Tea Lots
                  </p>
                  <div className="space-y-1">
                    {searchResults.lots.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => navigateTo("/admin/inventory")}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-cream/50 text-left transition-colors group"
                      >
                        <div>
                          <p className="font-bold text-brown">{l.garden}</p>
                          <p className="text-[0.7rem] text-brown-soft font-mono">{l.id} • {l.grade}</p>
                        </div>
                        <span className="font-mono text-xs font-bold text-leaf">{l.remainingKg} kg left</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.products.length === 0 &&
                searchResults.orders.length === 0 &&
                searchResults.customers.length === 0 &&
                searchResults.lots.length === 0 && (
                  <div className="py-8 text-center text-brown-soft">
                    <p className="font-bold">No results found for &ldquo;{query}&rdquo;</p>
                    <p className="text-[0.7rem] mt-1">Try searching by order ID, tea name, or customer phone.</p>
                  </div>
                )}
            </div>
          ) : (
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brown-soft/80 mb-2 px-2">
                Quick Navigation
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {QUICK_PAGES.map((page) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.path}
                      type="button"
                      onClick={() => navigateTo(page.path)}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-line hover:bg-cream/40 text-left transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-lg bg-cream flex items-center justify-center text-leaf group-hover:bg-leaf group-hover:text-cream transition-colors">
                          <Icon className="size-3.5" />
                        </div>
                        <span className="font-semibold text-brown group-hover:text-leaf-deep transition-colors">
                          {page.label}
                        </span>
                      </div>
                      <ArrowRight className="size-3.5 text-brown-soft/50 group-hover:text-leaf group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2.5 border-t border-line bg-cream/20 flex items-center justify-between text-[0.7rem] text-brown-soft">
          <span>Navigate with mouse or keyboard</span>
          <span className="font-mono">Cha Nir OS v2.4</span>
        </div>
      </div>
    </div>
  );
}

