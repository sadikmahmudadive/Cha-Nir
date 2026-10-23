import { getProduct, getVariant, type Product, type Variant } from "./products";

export const bdt = (n: number) => `৳${Math.round(n).toLocaleString("en-IN")}`;

/** Bulk discount, by total weight in the basket (placeholder tiers). */
export const TIERS = [
  { kg: 10, pct: 5, label: "Counter" },
  { kg: 25, pct: 8, label: "Shop" },
  { kg: 50, pct: 12, label: "Wholesale" },
] as const;

export const FREE_DELIVERY_OVER = 2500;
export const DELIVERY_FEE = 80;

export type Line = { slug: string; variantId: string; qty: number };

export type DetailedLine = Line & {
  product: Product;
  variant: Variant;
  total: number;
  kg: number;
};

export function detail(lines: Line[]): DetailedLine[] {
  return lines.flatMap((l) => {
    const product = getProduct(l.slug);
    const variant = product && getVariant(product, l.variantId);
    if (!product || !variant) return [];
    return [
      {
        ...l,
        product,
        variant,
        total: variant.price * l.qty,
        kg: (variant.grams * l.qty) / 1000,
      },
    ];
  });
}

export function summarize(lines: Line[]) {
  const items = detail(lines);
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const kg = items.reduce((s, i) => s + i.kg, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const tier = [...TIERS].reverse().find((t) => kg >= t.kg);
  const nextTier = TIERS.find((t) => kg < t.kg);
  const discount = tier ? Math.round((subtotal * tier.pct) / 100) : 0;
  const afterDiscount = subtotal - discount;
  const delivery =
    items.length === 0 || afterDiscount >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
  return {
    items,
    count,
    kg,
    subtotal,
    tier,
    nextTier,
    discount,
    delivery,
    total: afterDiscount + delivery,
  };
}
