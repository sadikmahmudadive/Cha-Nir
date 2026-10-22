import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopClient, ShopSkeleton } from "@/components/shop/ShopClient";
import { Breadcrumbs } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Shop Tea",
  description: "Browse Cha Nir packaged tea: black tea, green tea, special blends and bulk packs.",
};

export default function ShopPage() {
  return (
    <div className="container-x pb-24 pt-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop Tea" }]} />
      <header className="mb-10 mt-6 max-w-2xl space-y-3">
        <h1 className="t-h1 text-balance text-tea-900">Shop Tea</h1>
        <p className="t-lead text-ink-soft text-pretty">
          Authentic Bangladeshi tea for every cup, from everyday packs to bulk supply for your business.
        </p>
      </header>
      <Suspense fallback={<ShopSkeleton />}>
        <ShopClient />
      </Suspense>
    </div>
  );
}
