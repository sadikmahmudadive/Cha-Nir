/**
 * ──────────────────────────────────────────────────────────────
 *  DEMO DATA - NOT REAL CHA NIR CATALOG DATA
 *  Product names, pack sizes, prices and stock below are placeholders so the
 *  prototype is usable. Replace with Firestore-backed repositories
 *  (see src/lib/repositories.ts) once the real catalog is supplied.
 * ──────────────────────────────────────────────────────────────
 */
import type { Category, ImageRef, Product, Variant } from "@/types/catalog";

export const categories: Category[] = [
  {
    id: "cat-premium",
    slug: "premium-black-tea",
    name: "Premium Black Tea",
    blurb: "Full-bodied loose leaf for the slow, considered cup.",
    image: { kind: "leaf", tone: "deep", alt: "Loose black tea leaves" },
  },
  {
    id: "cat-everyday",
    slug: "everyday-tea",
    name: "Everyday Tea",
    blurb: "Dependable, rich and made for every morning.",
    image: { kind: "glass", tone: "warm", alt: "Freshly brewed tea in a clear glass" },
  },
  {
    id: "cat-green",
    slug: "green-tea",
    name: "Green Tea",
    blurb: "Light, fresh and gently grassy.",
    image: { kind: "garden", tone: "light", alt: "Rolling green tea garden hills" },
  },
  {
    id: "cat-blends",
    slug: "special-blends",
    name: "Special Blends",
    blurb: "Considered blends for gifting and special moments.",
    image: { kind: "cup", tone: "warm", alt: "Ceramic cup of tea seen from above" },
  },
  {
    id: "cat-bulk",
    slug: "bulk-tea",
    name: "Bulk Tea",
    blurb: "Large packs for stalls, shops, hotels and resellers.",
    image: { kind: "bulk", tone: "deep", alt: "Stacked bulk tea packs" },
  },
];

const v = (
  id: string,
  label: string,
  price: number,
  stock: number,
  extra: Partial<Variant> = {},
): Variant => ({ id, label, sku: `DEMO-${id.toUpperCase()}`, price, stock, ...extra });

const pack = (alt: string, tone: ImageRef["tone"] = "light"): ImageRef => ({ kind: "pack", tone, alt });

const brewBlack = [
  "Use freshly boiled water.",
  "Add about 1 teaspoon (2-3 g) of tea per cup.",
  "Steep 3-4 minutes, then strain and serve.",
  "Enjoy plain, with milk, or with sugar to taste.",
];
const brewGreen = [
  "Let boiled water cool for 2-3 minutes first.",
  "Add about 1 teaspoon of tea per cup.",
  "Steep 2-3 minutes and strain.",
];
const storage =
  "Store in a cool, dry place away from direct sunlight and strong odours. Reseal the pack tightly after opening.";

export const products: Product[] = [
  {
    id: "p-premium-loose",
    slug: "premium-black-tea-loose-leaf",
    name: "Premium Black Tea",
    categoryId: "cat-premium",
    short: "Loose leaf black tea with a deep colour and a bold, clean finish.",
    description:
      "A full-bodied loose leaf black tea sourced from tea gardens in Bangladesh, processed and packed by Cha Nir. Brews a deep amber cup that holds up to milk and sugar, or stands alone.",
    image: pack("Cha Nir premium black tea pack"),
    gallery: [
      pack("Front of the premium black tea pack"),
      { kind: "leaf", tone: "deep", alt: "Close view of loose black tea leaves" },
      { kind: "glass", tone: "warm", alt: "Brewed black tea in a clear glass" },
      { kind: "ritual", tone: "warm", alt: "Pouring tea into a cup" },
    ],
    variants: [
      v("pl-100", "100 g", 220, 40),
      v("pl-250", "250 g", 520, 28, { compareAt: 560 }),
      v("pl-500", "500 g", 980, 9),
      v("pl-1000", "1 kg", 1850, 0),
    ],
    badge: "Bestseller",
    viewer: {},
    featured: true,
    bestseller: true,
    createdAt: "2026-07-14",
    details: [
      { label: "Type", value: "Black tea, loose leaf" },
      { label: "Origin", value: "Bangladesh" },
      { label: "Packed by", value: "Cha Nir" },
      { label: "Best for", value: "Plain, milk or sugar" },
    ],
    ingredients: "100% black tea.",
    brewing: brewBlack,
    storage,
    demo: true,
  },
  {
    id: "p-everyday",
    slug: "everyday-tea",
    name: "Everyday Tea",
    categoryId: "cat-everyday",
    short: "A strong, dependable cup for the whole household.",
    description:
      "Our everyday tea is made for daily brewing: robust colour, a rounded flavour and great value across larger family packs.",
    image: pack("Cha Nir everyday tea pack", "warm"),
    gallery: [
      pack("Front of the everyday tea pack", "warm"),
      { kind: "glass", tone: "warm", alt: "Tea poured into a glass" },
      { kind: "cup", tone: "warm", alt: "Cup of tea on a table" },
    ],
    variants: [v("ed-250", "250 g", 240, 60), v("ed-500", "500 g", 460, 44), v("ed-1000", "1 kg", 880, 18)],
    featured: true,
    bestseller: true,
    createdAt: "2026-06-02",
    details: [
      { label: "Type", value: "Black tea, granulated" },
      { label: "Origin", value: "Bangladesh" },
      { label: "Best for", value: "Daily brewing, milk tea" },
    ],
    ingredients: "100% black tea.",
    brewing: brewBlack,
    storage,
    demo: true,
  },
  {
    id: "p-green",
    slug: "green-tea",
    name: "Green Tea",
    categoryId: "cat-green",
    short: "Light, fresh and gently grassy, brewed cool and short.",
    description:
      "A delicate green tea for an easy afternoon cup. Brew it with cooled water for a smooth, clean flavour.",
    image: pack("Cha Nir green tea pack", "light"),
    gallery: [
      pack("Front of the green tea pack", "light"),
      { kind: "garden", tone: "light", alt: "Tea garden hills" },
      { kind: "glass", tone: "light", alt: "Green tea in a glass" },
    ],
    variants: [v("gr-50", "50 g", 180, 32), v("gr-100", "100 g", 340, 7), v("gr-250", "250 g", 780, 20)],
    featured: true,
    createdAt: "2026-08-21",
    details: [
      { label: "Type", value: "Green tea" },
      { label: "Origin", value: "Bangladesh" },
      { label: "Best for", value: "Light afternoon cups" },
    ],
    ingredients: "100% green tea.",
    brewing: brewGreen,
    storage,
    demo: true,
  },
  {
    id: "p-blend-masala",
    slug: "masala-chai-blend",
    name: "Masala Chai Blend",
    categoryId: "cat-blends",
    short: "Black tea with warming spices, made for milk tea.",
    description:
      "A spiced blend for those slow evenings. Simmer with milk for a fragrant, comforting cup.",
    image: pack("Cha Nir masala chai blend pack", "warm"),
    gallery: [
      pack("Front of the masala chai blend pack", "warm"),
      { kind: "cup", tone: "warm", alt: "Spiced tea in a cup" },
      { kind: "ritual", tone: "warm", alt: "Serving spiced tea" },
    ],
    variants: [v("mb-100", "100 g", 260, 25), v("mb-250", "250 g", 610, 12)],
    badge: "New",
    featured: true,
    createdAt: "2026-10-01",
    details: [
      { label: "Type", value: "Spiced black tea blend" },
      { label: "Best for", value: "Milk tea, evenings" },
    ],
    ingredients: "Black tea and spices. Full ingredient list to be confirmed by Cha Nir.",
    brewing: [
      "Simmer 1 teaspoon per cup in water for 2 minutes.",
      "Add milk and warm through.",
      "Strain and sweeten to taste.",
    ],
    storage,
    demo: true,
  },
  {
    id: "p-gift",
    slug: "tea-gift-collection",
    name: "Tea Gift Collection",
    categoryId: "cat-blends",
    short: "Three small packs presented together for gifting.",
    description:
      "A curated trio of small packs in a presentation box: ideal for introducing someone to Cha Nir.",
    image: pack("Cha Nir gift collection", "light"),
    gallery: [pack("Gift collection box", "light"), { kind: "ritual", tone: "light", alt: "Tea being served" }],
    variants: [v("gc-3", "3 × 50 g", 690, 14)],
    createdAt: "2026-09-10",
    details: [
      { label: "Contents", value: "Three small packs (selection to be confirmed)" },
      { label: "Best for", value: "Gifting" },
    ],
    brewing: brewBlack,
    storage,
    demo: true,
  },
  {
    id: "p-premium-dust",
    slug: "premium-black-tea-strong",
    name: "Strong Black Tea",
    categoryId: "cat-premium",
    short: "Intensely coloured, made to stand up to milk.",
    description: "A strong, rich-coloured black tea designed for milk tea lovers.",
    image: pack("Cha Nir strong black tea pack", "deep"),
    gallery: [pack("Front of the strong black tea pack", "deep"), { kind: "leaf", tone: "deep", alt: "Dark tea leaves" }],
    variants: [v("sb-250", "250 g", 320, 36), v("sb-500", "500 g", 610, 22)],
    createdAt: "2026-05-18",
    details: [
      { label: "Type", value: "Black tea" },
      { label: "Best for", value: "Strong milk tea" },
    ],
    ingredients: "100% black tea.",
    brewing: brewBlack,
    storage,
    demo: true,
  },
  {
    id: "p-bulk-stall",
    slug: "bulk-everyday-tea-5kg",
    name: "Bulk Everyday Tea",
    categoryId: "cat-bulk",
    short: "Large-format packs for tea stalls and busy counters.",
    description:
      "Everyday tea packed in larger sizes for businesses serving tea all day. Volume pricing and minimum quantities are configurable.",
    image: { kind: "bulk", tone: "deep", alt: "Bulk tea packs" },
    gallery: [
      { kind: "bulk", tone: "deep", alt: "Bulk tea packs" },
      { kind: "stall", tone: "warm", alt: "Tea being served at a tea stall" },
    ],
    variants: [
      v("bk-5", "5 kg", 3900, 30, { wholesalePrice: 3600 }),
      v("bk-10", "10 kg", 7600, 18, { wholesalePrice: 7000 }),
      v("bk-25", "25 kg", 18200, 6, { wholesalePrice: 16500 }),
    ],
    isBulk: true,
    createdAt: "2026-04-05",
    details: [
      { label: "Type", value: "Black tea, bulk pack" },
      { label: "Audience", value: "Tea stalls, shops, hotels, resellers" },
    ],
    ingredients: "100% black tea.",
    brewing: brewBlack,
    storage,
    demo: true,
  },
  {
    id: "p-bulk-premium",
    slug: "bulk-premium-black-tea",
    name: "Bulk Premium Black Tea",
    categoryId: "cat-bulk",
    short: "Premium loose leaf in bulk for hotels and restaurants.",
    description: "Premium black tea for hospitality businesses that want a better cup at volume.",
    image: { kind: "bulk", tone: "warm", alt: "Bulk premium tea packs" },
    gallery: [{ kind: "bulk", tone: "warm", alt: "Bulk premium tea packs" }, { kind: "glass", tone: "warm", alt: "Tea served in a glass" }],
    variants: [
      v("bp-5", "5 kg", 6200, 12, { wholesalePrice: 5800 }),
      v("bp-10", "10 kg", 12000, 0, { wholesalePrice: 11200 }),
    ],
    isBulk: true,
    createdAt: "2026-04-20",
    details: [
      { label: "Type", value: "Black tea, loose leaf, bulk" },
      { label: "Audience", value: "Hotels, restaurants, cafés" },
    ],
    ingredients: "100% black tea.",
    brewing: brewBlack,
    storage,
    demo: true,
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const productById = (id: string) => products.find((p) => p.id === id);
export const categoryById = (id: string) => categories.find((c) => c.id === id);
export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
export const variantOf = (p: Product, variantId: string) =>
  p.variants.find((x) => x.id === variantId) ?? p.variants[0];

/** Lowest-priced in-stock variant (falls back to the first) - used by cards. */
export const defaultVariant = (p: Product) =>
  p.variants.find((x) => x.stock > 0) ?? p.variants[0];

export const relatedTo = (p: Product, n = 4) =>
  products
    .filter((x) => x.id !== p.id)
    .sort((a, b) => Number(b.categoryId === p.categoryId) - Number(a.categoryId === p.categoryId))
    .slice(0, n);
