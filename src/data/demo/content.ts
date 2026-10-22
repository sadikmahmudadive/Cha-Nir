/**
 * DEMO CONTENT - placeholders for editorial, reviews, delivery and orders.
 * Nothing here is a real endorsement, order or delivery policy.
 */
import type { JournalPost, Order } from "@/types/catalog";

export const journal: JournalPost[] = [
  {
    slug: "how-to-brew-a-better-cup-of-black-tea",
    category: "Brewing",
    title: "How to Brew a Better Cup of Black Tea",
    excerpt: "Water, time and leaf: three small things that change the cup.",
    readingTime: "5 min read",
    image: { kind: "glass", tone: "warm", alt: "Black tea steeping in a glass" },
  },
  {
    slug: "choosing-the-right-tea-for-your-tea-stall",
    category: "For business",
    title: "Choosing the Right Tea for Your Tea Stall",
    excerpt: "Consistency, colour and cost: what to look for in a bulk supply.",
    readingTime: "6 min read",
    image: { kind: "stall", tone: "warm", alt: "A tea stall counter" },
  },
  {
    slug: "tea-culture-in-bangladesh",
    category: "Culture",
    title: "Tea Culture in Bangladesh",
    excerpt: "From the hills of Sylhet to the corner stall: a shared ritual.",
    readingTime: "7 min read",
    image: { kind: "garden", tone: "light", alt: "Tea garden hills" },
  },
  {
    slug: "how-to-store-packaged-tea-properly",
    category: "Care",
    title: "How to Store Packaged Tea Properly",
    excerpt: "Keep your tea fresh, fragrant and flavourful for longer.",
    readingTime: "4 min read",
    image: { kind: "pack", tone: "light", alt: "A resealed tea pack" },
  },
];

/** Placeholder review slots. Replace with verified reviews from Firestore. */
export const reviewSlots = [
  { id: "r1", label: "Verified review slot 1" },
  { id: "r2", label: "Verified review slot 2" },
  { id: "r3", label: "Verified review slot 3" },
];

export const districts = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Gazipur",
  "Narayanganj",
  "Cumilla",
  "Cox's Bazar",
  "Other district",
];

/**
 * DEMO delivery configuration. Fees are placeholders - the real values are set
 * in Admin → Delivery. The storefront only reads this shape.
 */
export const deliveryConfig = {
  isDemo: true,
  zones: [
    { id: "dhaka", label: "Dhaka", fee: 60, districts: ["Dhaka", "Gazipur", "Narayanganj"] },
    { id: "outside", label: "Outside Dhaka", fee: 120, districts: [] as string[] },
  ],
  freeOver: null as number | null,
};

export function deliveryFor(district: string): number | null {
  if (!district) return null;
  const zone = deliveryConfig.zones.find((z) => z.districts.includes(district));
  return (zone ?? deliveryConfig.zones[deliveryConfig.zones.length - 1]).fee;
}

/** DEMO discount codes. Real codes live in Firestore and are validated server-side. */
export const discountCodes: Record<string, { type: "percent" | "fixed"; value: number; label: string }> = {
  DEMO10: { type: "percent", value: 10, label: "10% off (demo code)" },
  DEMO50: { type: "fixed", value: 50, label: "৳50 off (demo code)" },
};

export const demoOrders: Order[] = [
  {
    id: "CN-DEMO-1042",
    placedAt: "2026-10-12",
    status: "delivered",
    payment: "cod",
    customer: "Demo Customer",
    lines: [
      { productId: "p-premium-loose", variantId: "pl-250", qty: 2, unitPrice: 520 },
      { productId: "p-green", variantId: "gr-100", qty: 1, unitPrice: 340 },
    ],
    subtotal: 1380,
    discount: 0,
    delivery: 60,
    total: 1440,
    address: "House 12, Road 4, Dhanmondi",
    district: "Dhaka",
  },
  {
    id: "CN-DEMO-1057",
    placedAt: "2026-10-18",
    status: "shipped",
    payment: "gateway",
    customer: "Demo Customer",
    lines: [{ productId: "p-everyday", variantId: "ed-1000", qty: 3, unitPrice: 880 }],
    subtotal: 2640,
    discount: 264,
    delivery: 60,
    total: 2436,
    address: "House 12, Road 4, Dhanmondi",
    district: "Dhaka",
  },
  {
    id: "CN-DEMO-1063",
    placedAt: "2026-10-21",
    status: "pending",
    payment: "cod",
    customer: "Demo Customer",
    lines: [{ productId: "p-blend-masala", variantId: "mb-100", qty: 2, unitPrice: 260 }],
    subtotal: 520,
    discount: 0,
    delivery: 60,
    total: 580,
    address: "House 12, Road 4, Dhanmondi",
    district: "Dhaka",
  },
];

export const orderTimeline = ["pending", "confirmed", "packed", "shipped", "delivered"] as const;
