"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { cartActions, useCart } from "@/lib/cart";
import { bdt, FREE_DELIVERY_OVER } from "@/lib/pricing";

export function CartDrawer() {
  const { open, summary } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cartActions.close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const { tier, nextTier, kg } = summary;
  const tierGoal = nextTier ?? tier;
  const progress = tierGoal ? Math.min(100, (kg / tierGoal.kg) * 100) : 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-50 bg-brown/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cartActions.close}
            aria-hidden
          />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-cream shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-serif text-2xl">
                Your cart{" "}
                <span className="font-sans text-base font-medium text-brown-soft">
                  ({summary.count})
                </span>
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={cartActions.close}
                aria-label="Close cart"
                className="inline-flex size-11 items-center justify-center rounded-full hover:bg-cream-2"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            {summary.items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <span className="grid size-20 place-items-center rounded-full bg-leaf-soft text-leaf">
                  <ShoppingBag className="size-9" aria-hidden />
                </span>
                <p className="font-serif text-2xl">Your cart is empty</p>
                <p className="text-brown-soft">Find a tea for your counter or your kitchen.</p>
                <Link href="/shop" onClick={cartActions.close} className="btn btn-lime">
                  Browse the shop
                </Link>
              </div>
            ) : (
              <>
                <div className="border-b border-line bg-leaf-soft/60 px-5 py-4">
                  <p className="text-[0.9375rem] font-semibold">
                    {nextTier
                      ? `Add ${(nextTier.kg - kg).toFixed(nextTier.kg - kg < 1 ? 2 : 1)} kg more to save ${nextTier.pct}%`
                      : `You're saving ${tier?.pct}% on bulk tea`}
                  </p>
                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full bg-cream"
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progress to next bulk discount"
                  >
                    <motion.div
                      className="h-full rounded-full bg-lime"
                      animate={{ width: `${progress}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    />
                  </div>
                </div>

                <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
                  <AnimatePresence initial={false}>
                    {summary.items.map((it) => (
                      <motion.li
                        key={it.slug + it.variantId}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-4 py-4">
                          <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-cream-2">
                            <Image
                              src={it.product.image}
                              alt=""
                              fill
                              sizes="80px"
                              className="object-cover"
                              style={{ objectPosition: it.product.focus }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/shop/${it.slug}`}
                              onClick={cartActions.close}
                              className="line-clamp-2 font-semibold leading-snug hover:text-leaf"
                            >
                              {it.product.name}
                            </Link>
                            <p className="text-[0.875rem] text-brown-soft">{it.variant.label} pack</p>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="inline-flex items-center rounded-full border border-line bg-[#fffdf6]">
                                <button
                                  type="button"
                                  aria-label={`Decrease quantity of ${it.product.name}`}
                                  onClick={() => cartActions.setQty(it.slug, it.variantId, it.qty - 1)}
                                  className="grid size-11 place-items-center rounded-full hover:bg-cream-2"
                                >
                                  {it.qty === 1 ? (
                                    <Trash2 className="size-4" aria-hidden />
                                  ) : (
                                    <Minus className="size-4" aria-hidden />
                                  )}
                                </button>
                                <span className="min-w-7 text-center font-bold tabular-nums" aria-live="polite">
                                  {it.qty}
                                </span>
                                <button
                                  type="button"
                                  aria-label={`Increase quantity of ${it.product.name}`}
                                  onClick={() => cartActions.setQty(it.slug, it.variantId, it.qty + 1)}
                                  className="grid size-11 place-items-center rounded-full hover:bg-cream-2"
                                >
                                  <Plus className="size-4" aria-hidden />
                                </button>
                              </div>
                              <span className="font-bold tabular-nums">{bdt(it.total)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="space-y-2 border-t border-line bg-[#fffdf6] px-5 py-5">
                  <Row label="Subtotal" value={bdt(summary.subtotal)} />
                  {summary.discount > 0 && (
                    <Row
                      label={`Bulk saving (${tier?.pct}%)`}
                      value={`−${bdt(summary.discount)}`}
                      accent
                    />
                  )}
                  <Row
                    label="Delivery"
                    value={summary.delivery === 0 ? "Free" : bdt(summary.delivery)}
                    hint={summary.delivery > 0 ? `Free over ${bdt(FREE_DELIVERY_OVER)}` : undefined}
                  />
                  <div className="flex items-baseline justify-between border-t border-line pt-3">
                    <span className="font-serif text-xl">Total</span>
                    <span className="font-bn text-2xl font-bold tabular-nums">{bdt(summary.total)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={cartActions.close}
                    className="btn btn-lime mt-3 w-full"
                  >
                    Checkout
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[0.9375rem]">
      <span className="text-brown-soft">
        {label}
        {hint && <span className="ml-2 text-[0.8125rem]">({hint})</span>}
      </span>
      <span className={`font-semibold tabular-nums ${accent ? "text-leaf" : ""}`}>{value}</span>
    </div>
  );
}
