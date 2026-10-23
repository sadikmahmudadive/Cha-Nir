"use client";

import { useSyncExternalStore } from "react";
import { getProduct, getVariant } from "./products";
import { summarize, type Line } from "./pricing";

const KEY = "chanir.cart.v1";

type State = { lines: Line[]; open: boolean };

const EMPTY: State = { lines: [], open: false };
const listeners = new Set<() => void>();
let state: State = EMPTY;
let loaded = false;

function sanitize(raw: unknown): Line[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((l) => {
    const p = typeof l?.slug === "string" ? getProduct(l.slug) : undefined;
    if (!p || !getVariant(p, l.variantId)) return [];
    const qty = Math.min(999, Math.max(1, Math.floor(Number(l.qty) || 1)));
    return [{ slug: l.slug, variantId: l.variantId, qty }];
  });
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...state, lines: sanitize(JSON.parse(raw)) };
  } catch {
    /* storage unavailable: start with an empty cart */
  }
}

function commit(next: Partial<State>) {
  state = { ...state, ...next };
  if (next.lines) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state.lines));
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const getSnapshot = () => {
  load();
  return state;
};
const getServerSnapshot = () => EMPTY;

export const cartActions = {
  add(slug: string, variantId: string, qty = 1, openDrawer = true) {
    load();
    const lines = [...state.lines];
    const i = lines.findIndex((l) => l.slug === slug && l.variantId === variantId);
    if (i >= 0) lines[i] = { ...lines[i], qty: Math.min(999, lines[i].qty + qty) };
    else lines.push({ slug, variantId, qty });
    commit({ lines, open: openDrawer ? true : state.open });
  },
  setQty(slug: string, variantId: string, qty: number) {
    load();
    const lines =
      qty <= 0
        ? state.lines.filter((l) => !(l.slug === slug && l.variantId === variantId))
        : state.lines.map((l) =>
            l.slug === slug && l.variantId === variantId
              ? { ...l, qty: Math.min(999, qty) }
              : l,
          );
    commit({ lines });
  },
  clear() {
    commit({ lines: [] });
  },
  open() {
    commit({ open: true });
  },
  close() {
    commit({ open: false });
  },
};

export function useCart() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { ...s, summary: summarize(s.lines) };
}
