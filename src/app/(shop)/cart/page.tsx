import type { Metadata } from "next";
import { CartPage } from "@/components/cart/CartPage";
import { Breadcrumbs } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Your cart" };

export default function Page() {
  return (
    <div className="container-x pb-24 pt-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <h1 className="t-h1 mb-8 mt-6 text-tea-900">Your cart</h1>
      <CartPage />
    </div>
  );
}
