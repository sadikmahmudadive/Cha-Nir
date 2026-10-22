"use client";

import { AnimatePresence } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-store";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/misc";
import { CartLineItem, DiscountForm, SummaryRows } from "./CartParts";

export function CartPage() {
  const cart = useCart();
  if (cart.lines.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-8" aria-hidden />}
        title="Your cart is empty"
        body="Find something for your next cup."
        action={{ label: "Shop tea", href: "/shop" }}
        className="rounded-card border border-dashed border-line"
      />
    );
  }
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
      <ul className="divide-y divide-line">
        <AnimatePresence initial={false} mode="popLayout">
          {cart.lines.map((l) => (
            <CartLineItem key={l.variant.id} line={l} />
          ))}
        </AnimatePresence>
      </ul>
      <aside className="h-fit space-y-5 rounded-card border border-line bg-paper p-6 lg:sticky lg:top-28" aria-label="Order summary">
        <h2 className="font-display text-2xl">Summary</h2>
        <DiscountForm />
        <SummaryRows {...cart} />
        <Button href="/checkout" size="lg" full>Proceed to checkout</Button>
        <Button href="/shop" variant="ghost" size="sm" full>Continue shopping</Button>
      </aside>
    </div>
  );
}
