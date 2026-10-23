"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { cartActions } from "@/lib/cart";
import { bdt, TIERS } from "@/lib/pricing";
import { perKg, type Product } from "@/lib/products";

export function PurchasePanel({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(
    product.variants[Math.min(1, product.variants.length - 1)].id,
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const kg = (variant.grams * qty) / 1000;
  const next = TIERS.find((t) => kg < t.kg);
  const reached = [...TIERS].reverse().find((t) => kg >= t.kg);

  const add = () => {
    cartActions.add(product.slug, variant.id, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="mt-8 rounded-3xl border border-line bg-[#fffdf6] p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.8125rem] font-bold uppercase tracking-wider text-brown-soft">Price</p>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={variant.id + qty}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="font-bn text-4xl font-bold tabular-nums"
            >
              {bdt(variant.price * qty)}
            </motion.p>
          </AnimatePresence>
        </div>
        <p className="pb-1.5 text-[0.9375rem] font-semibold text-brown-soft">
          {bdt(perKg(variant))} / kg
        </p>
      </div>

      <fieldset className="mt-6">
        <legend className="text-[0.8125rem] font-bold uppercase tracking-wider text-brown-soft">
          Pack size
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.variants.map((v) => {
            const on = v.id === variantId;
            return (
              <label
                key={v.id}
                className={`relative inline-flex min-h-12 min-w-20 cursor-pointer items-center justify-center rounded-2xl border-2 px-4 font-bold transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-lime ${
                  on ? "border-leaf text-cream" : "border-line hover:border-leaf/60"
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="variant-pill"
                    className="absolute inset-0 rounded-[0.85rem] bg-leaf"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <input
                  type="radio"
                  name="variant"
                  value={v.id}
                  checked={on}
                  onChange={() => setVariantId(v.id)}
                  className="sr-only"
                />
                <span className="relative">{v.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-line bg-cream">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid size-12 place-items-center rounded-full hover:bg-cream-2"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <span className="min-w-9 text-center text-lg font-bold tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="grid size-12 place-items-center rounded-full hover:bg-cream-2"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
        <button type="button" onClick={add} className="btn btn-lime h-12 flex-1 gap-2 text-base">
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="ok"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-2"
              >
                <Check className="size-5" aria-hidden /> Added to cart
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-2"
              >
                <ShoppingBag className="size-5" aria-hidden /> Add to cart
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <p className="mt-4 rounded-2xl bg-leaf-soft px-4 py-3 text-[0.9375rem] font-semibold text-leaf-deep">
        {reached
          ? `${reached.pct}% bulk saving applies at ${kg.toFixed(kg < 10 ? 1 : 0)} kg.`
          : next
            ? `Reach ${next.kg} kg across your basket to save ${next.pct}%.`
            : null}{" "}
        <Link href="/wholesale" className="underline underline-offset-2">
          See wholesale tiers
        </Link>
      </p>
    </div>
  );
}
