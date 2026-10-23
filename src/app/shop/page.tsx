import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopClient } from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop tea",
  description:
    "Black, green and specialty tea from Bangladesh in packs from 50 g to 25 kg. Retail and wholesale.",
};

export default function ShopPage() {
  return (
    <div className="container-x pb-8 pt-10 lg:pt-16">
      <p className="eyebrow">The tea shelf</p>
      <h1 className="mt-3 max-w-3xl text-5xl sm:text-6xl">Shop tea</h1>
      <p className="mt-4 max-w-xl text-lg text-brown-soft">
        From a 50 g trial pouch to a 25 kg stall sack. Bulk savings apply automatically in your cart.
      </p>
      <Suspense fallback={<div className="mt-10 h-96" aria-busy />}>
        <ShopClient />
      </Suspense>
    </div>
  );
}
