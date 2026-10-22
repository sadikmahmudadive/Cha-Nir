"use client";

import { useMemo, useSyncExternalStore } from "react";
import { discountCodes, deliveryFor } from "@/data/demo/content";
import { productById, variantOf } from "@/data/demo/catalog";
import type { CartItem, Product, Variant } from "@/types/catalog";

/**
 * Cart state lives in a tiny external store (useSyncExternalStore) so it is
 * hydration-safe and shared across the header badge, drawer, PDP and checkout.
 * Persisted to localStorage only. Server-side cart/order creation is a backend
 * integration point (see docs/IMPLEMENTATION.md).
 */
interface State {
  items: CartItem[];
  discount: string | null;
  open: boolean;
  /** Last add-to-cart event; drives success feedback and the live region. */
  added: { key: number; name: string; label: string } | null;
  /** Screen-reader announcement for the polite live region. */
  announce: string;
}

const KEY = "chanir.cart.v1";
const empty: State = { items: [], discount: null, open: false, added: null, announce: "" };
let state: State = empty;
let hydrated = false;
const listeners = new Set<() => void>();

function load() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Pick<State, "items" | "discount">;
      const items = (parsed.items ?? []).filter((i) => productById(i.productId));
      state = { ...empty, items, discount: parsed.discount ?? null };
    }
  } catch {
    /* storage unavailable - start empty */
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ items: state.items, discount: state.discount }));
  } catch {
    /* ignore */
  }
}

function set(next: Partial<State>, save = true) {
  state = { ...state, ...next };
  if (save) persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  return () => listeners.delete(cb);
}
const getSnapshot = () => {
  load();
  return state;
};
const getServerSnapshot = () => empty;

export const cartActions = {
  add(product: Product, variant: Variant, qty = 1) {
    if (variant.stock <= 0) return false;
    const idx = state.items.findIndex((i) => i.variantId === variant.id);
    const items = [...state.items];
    if (idx >= 0) items[idx] = { ...items[idx], qty: Math.min(variant.stock, items[idx].qty + qty) };
    else items.push({ productId: product.id, variantId: variant.id, qty: Math.min(variant.stock, qty) });
    set({
      items,
      added: { key: Date.now(), name: product.name, label: variant.label },
      announce: `${product.name}, ${variant.label}, added to cart.`,
    });
    return true;
  },
  setQty(variantId: string, qty: number) {
    const item = state.items.find((i) => i.variantId === variantId);
    if (!item) return;
    const p = productById(item.productId);
    const max = p ? variantOf(p, variantId).stock : qty;
    const q = Math.max(1, Math.min(max, qty));
    set({
      items: state.items.map((i) => (i.variantId === variantId ? { ...i, qty: q } : i)),
      announce: `Quantity updated to ${q}.`,
    });
  },
  remove(variantId: string) {
    const item = state.items.find((i) => i.variantId === variantId);
    const p = item && productById(item.productId);
    set({
      items: state.items.filter((i) => i.variantId !== variantId),
      announce: p ? `${p.name} removed from cart.` : "Item removed.",
    });
  },
  clear() {
    set({ items: [], discount: null, announce: "Cart cleared." });
  },
  open() {
    set({ open: true }, false);
  },
  close() {
    set({ open: false }, false);
  },
  applyDiscount(raw: string): { ok: boolean; message: string } {
    const code = raw.trim().toUpperCase();
    if (!code) return { ok: false, message: "Enter a discount code." };
    const found = discountCodes[code];
    if (!found) return { ok: false, message: "That code isn't valid. Check it and try again." };
    set({ discount: code, announce: `Discount ${code} applied.` });
    return { ok: true, message: `${found.label} applied.` };
  },
  removeDiscount() {
    set({ discount: null, announce: "Discount removed." });
  },
};

export interface CartLine {
  item: CartItem;
  product: Product;
  variant: Variant;
  lineTotal: number;
}

export function computeTotals(lines: CartLine[], discount: string | null, district?: string) {
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const code = discount ? discountCodes[discount] : undefined;
  const discountAmount = code
    ? Math.min(subtotal, code.type === "percent" ? Math.round((subtotal * code.value) / 100) : code.value)
    : 0;
  const deliveryFee = district ? deliveryFor(district) : null;
  return {
    subtotal,
    discountAmount,
    deliveryFee,
    total: subtotal - discountAmount + (deliveryFee ?? 0),
    discountLabel: code?.label,
  };
}

export function useCart(district?: string) {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    const lines: CartLine[] = s.items.flatMap((item) => {
      const product = productById(item.productId);
      if (!product) return [];
      const variant = variantOf(product, item.variantId);
      return [{ item, product, variant, lineTotal: variant.price * item.qty }];
    });
    const count = lines.reduce((n, l) => n + l.item.qty, 0);
    return { ...s, lines, count, ...computeTotals(lines, s.discount, district) };
  }, [s, district]);
}
