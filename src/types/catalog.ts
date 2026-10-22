/**
 * Domain types. These mirror the intended Firestore documents so the demo data
 * (src/data/demo) can be swapped for real repositories without touching UI.
 */

export type ArtKind =
  | "garden"
  | "leaf"
  | "glass"
  | "pack"
  | "cup"
  | "bulk"
  | "ritual"
  | "stall";

export type ArtTone = "light" | "deep" | "warm";

export interface ImageRef {
  /** Cloudinary public id or absolute URL. When absent a designed placeholder renders. */
  src?: string;
  kind: ArtKind;
  tone?: ArtTone;
  alt: string;
}

export interface Variant {
  id: string;
  label: string;
  sku: string;
  /** Retail price in BDT (whole taka). */
  price: number;
  compareAt?: number;
  /** Wholesale price per pack, shown only in public-catalog mode or to approved accounts. */
  wholesalePrice?: number;
  stock: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  image: ImageRef;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  short: string;
  description: string;
  image: ImageRef;
  gallery: ImageRef[];
  variants: Variant[];
  badge?: string;
  /** Enables the optional 3D viewer. Provide `modelUrl` (compressed GLB) when an approved model exists. */
  viewer?: { modelUrl?: string };
  featured?: boolean;
  bestseller?: boolean;
  isBulk?: boolean;
  createdAt: string;
  /** Verified rating - only present when real, verified reviews exist. */
  rating?: { avg: number; count: number };
  details: { label: string; value: string }[];
  ingredients?: string;
  brewing?: string[];
  storage: string;
  demo: true;
}

export interface CartItem {
  productId: string;
  variantId: string;
  qty: number;
}

export type StockState = "in" | "low" | "out";

export const LOW_STOCK_AT = 10;

export function stockState(stock: number): StockState {
  if (stock <= 0) return "out";
  if (stock <= LOW_STOCK_AT) return "low";
  return "in";
}

export interface JournalPost {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readingTime: string;
  image: ImageRef;
}

export type OrderStatus = "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  placedAt: string;
  status: OrderStatus;
  payment: "cod" | "gateway";
  customer: string;
  lines: { productId: string; variantId: string; qty: number; unitPrice: number }[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  address: string;
  district: string;
}
