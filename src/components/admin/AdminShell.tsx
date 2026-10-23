"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MotionConfig } from "motion/react";
import {
  BarChart3,
  Boxes,
  FileText,
  LayoutDashboard,
  Package,
  Percent,
  ShoppingCart,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { firebaseConfigured } from "@/lib/firebase/client";

function SeedCatalogButton() {
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const { seedCatalogToFirestore } = await import("@/lib/firebase/services");
      await seedCatalogToFirestore();
      setSeeded(true);
      setTimeout(() => setSeeded(false), 4000);
    } catch (e) {
      console.error("Failed to seed catalog:", e);
      alert("Seeding failed: " + (e instanceof Error ? e.message : "check console"));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSeed}
      disabled={seeding}
      className="cursor-pointer font-semibold underline underline-offset-2 hover:opacity-80"
    >
      {seeding ? "Seeding to Firestore…" : seeded ? "✓ Catalog Seeded to Firestore!" : "Seed Catalog to Firestore"}
    </button>
  );
}

const nav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/wholesale", label: "Wholesale", icon: Store },
  { href: "/admin/discounts", label: "Discounts", icon: Percent },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/content", label: "Homepage", icon: FileText },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh bg-cream-deep/50 text-[0.95rem]">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-paper lg:flex" aria-label="Admin">
          <Link href="/admin" className="flex items-center gap-3 px-6 py-5">
            <Image src="/brand/logo.webp" alt="Cha Nir admin" width={1768} height={1303} className="h-12 w-auto" />
            <span className="rounded-full bg-tea-100 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-tea-800">Admin</span>
          </Link>
          <nav className="flex-1 overflow-y-auto px-3 pb-6">
            <ul className="space-y-0.5">
              {nav.map((n) => {
                const on = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
                return (
                  <li key={n.href}>
                    <Link href={n.href} aria-current={on ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-md px-3 font-semibold transition-colors", on ? "bg-tea-600 text-white" : "text-ink-soft hover:bg-tea-100")}>
                      <n.icon className="size-[1.1rem]" aria-hidden /> {n.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-line p-4 text-xs text-ink-mute">
            <Link href="/" className="font-semibold text-tea-700 underline underline-offset-4">← View storefront</Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
            <div className="flex min-h-14 items-center justify-between gap-4 px-4 sm:px-8">
              <nav aria-label="Admin mobile" className="flex gap-1 overflow-x-auto no-scrollbar lg:hidden">
                {nav.map((n) => (
                  <Link key={n.href} href={n.href} className={cn("shrink-0 rounded-full px-3 py-2 text-sm font-semibold", pathname === n.href ? "bg-tea-600 text-white" : "text-ink-soft")}>{n.label}</Link>
                ))}
              </nav>
              <p className="hidden text-sm text-ink-mute lg:block">
                {firebaseConfigured ? "Firebase Connected (cha-nir)" : "Prototype admin · demo data only"}
              </p>
              <p className="text-sm font-semibold">Admin user</p>
            </div>
            {firebaseConfigured ? (
              <div className="border-t border-success/20 bg-success-bg px-4 py-2 text-xs text-success sm:px-8 flex items-center justify-between gap-4">
                <span>Firebase Connected: <code>cha-nir</code> backend is active and ready.</span>
                <SeedCatalogButton />
              </div>
            ) : (
              <div className="border-t border-warn/20 bg-warn-bg px-4 py-2 text-xs text-warn sm:px-8">
                Prototype: changes live only in this browser tab. Production requires Firebase Auth with an <code>admin</code> custom claim, Firestore security rules and server-side writes.
              </div>
            )}
          </header>
          <main id="main" className="mx-auto max-w-[96rem] p-4 sm:p-8">{children}</main>
        </div>
      </div>
    </MotionConfig>
  );
}

