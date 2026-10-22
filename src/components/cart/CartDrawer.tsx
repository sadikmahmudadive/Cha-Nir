"use client";

import { AnimatePresence } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { cartActions, useCart } from "@/context/cart-store";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/misc";
import { CartLineItem, DiscountForm, SummaryRows } from "./CartParts";

export function CartDrawer() {
  const cart = useCart();

  return (
    <Sheet
      open={cart.open}
      onClose={cartActions.close}
      title={`Your cart${cart.count ? ` (${cart.count})` : ""}`}
      footer={
        cart.lines.length > 0 ? (
          <div className="space-y-4">
            <SummaryRows {...cart} />
            <p className="text-xs text-ink-mute">Delivery charge is calculated at checkout from your district.</p>
            <Button href="/checkout" size="lg" full onClick={cartActions.close}>
              Checkout
            </Button>
            <Button href="/cart" variant="ghost" size="sm" full onClick={cartActions.close}>
              View full cart
            </Button>
          </div>
        ) : undefined
      }
    >
      {cart.lines.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="size-7" aria-hidden />}
          title="Your cart is empty"
          body="Find something for your next cup."
          action={{ label: "Shop tea", href: "/shop" }}
        />
      ) : (
        <>
          <ul className="divide-y divide-line-soft">
            <AnimatePresence initial={false} mode="popLayout">
              {cart.lines.map((l) => (
                <CartLineItem key={l.variant.id} line={l} compact />
              ))}
            </AnimatePresence>
          </ul>
          <DiscountForm className="mt-4" />
        </>
      )}
    </Sheet>
  );
}
