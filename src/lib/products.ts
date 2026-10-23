export type Segment = "home" | "stall" | "shop" | "hotel" | "restaurant";

export const SEGMENTS: Record<
  Segment,
  { label: string; plural: string; blurb: string; pack: string }
> = {
  home: {
    label: "Home",
    plural: "Homes",
    blurb:
      "Small, fresh packs for the morning cup and the guests who drop by in the afternoon.",
    pack: "100 g – 500 g",
  },
  stall: {
    label: "Tea stall",
    plural: "Tea stalls",
    blurb:
      "Strong, consistent liquor that stands up to milk and sugar, pour after pour, all day.",
    pack: "1 kg – 25 kg sacks",
  },
  shop: {
    label: "Tea shop",
    plural: "Tea shops",
    blurb:
      "Retail-ready packs with a clean label, so your shelf sells the tea for you.",
    pack: "250 g – 5 kg",
  },
  hotel: {
    label: "Hotel",
    plural: "Hotels",
    blurb:
      "A refined cup for breakfast service and room trays, with steady supply and invoices.",
    pack: "500 g – 5 kg",
  },
  restaurant: {
    label: "Restaurant",
    plural: "Restaurants",
    blurb:
      "Tea that finishes a meal well. Mellow, bright and easy to brew in batches.",
    pack: "500 g – 5 kg",
  },
};

export type Category = "Black Tea" | "Green Tea" | "Specialty";

export type Variant = { id: string; label: string; grams: number; price: number };

export type Product = {
  slug: string;
  name: string;
  category: Category;
  grade: string;
  image: string;
  imageAlt: string;
  /** object-position for card crops */
  focus?: string;
  tagline: string;
  description: string;
  notes: string[];
  brew: { temp: string; amount: string; time: string };
  bestFor: Segment[];
  variants: Variant[];
  badge?: string;
};

const v = (grams: number, price: number): Variant => ({
  id: `${grams}g`,
  label: grams >= 1000 ? `${grams / 1000} kg` : `${grams} g`,
  grams,
  price,
});

// Prices are placeholders (BDT). Replace with the real price list.
export const PRODUCTS: Product[] = [
  {
    slug: "chai-ready-premium-loose",
    name: "Chai-Ready Premium Loose",
    category: "Black Tea",
    grade: "CTC",
    image: "/img/chai-ready-pouch.webp",
    imageAlt: "Cha Nir kraft pouch of premium loose black tea beside a small pile of leaf",
    focus: "70% 60%",
    tagline: "Rich, fragrant, built for milk chai.",
    description:
      "Our everyday workhorse. A dark, malty cup with a thick body that holds its colour and flavour once the milk goes in. The tea most of our stall and home customers reorder first.",
    notes: ["Malty", "Full-bodied", "Deep amber"],
    brew: { temp: "100°C", amount: "1 tsp per cup", time: "3–4 min" },
    bestFor: ["home", "stall", "shop"],
    variants: [v(100, 90), v(250, 215), v(500, 420), v(1000, 820)],
    badge: "Best seller",
  },
  {
    slug: "modhumoti-gold",
    name: "Modhumoti Gold Black Tea",
    category: "Black Tea",
    grade: "Granular CTC",
    image: "/img/modhumoti-scene.webp",
    imageAlt: "Pack of Modhumoti Gold black tea in front of a sunrise tea garden with a steaming cup",
    focus: "38% 50%",
    tagline: "Crisp, granular and quick to brew.",
    description:
      "Free-flowing granules that brew fast and bright, with a golden-red liquor. A reliable shelf pack for tea shops and a smart sack for busy counters.",
    notes: ["Brisk", "Bright red liquor", "Quick infusion"],
    brew: { temp: "100°C", amount: "1 tsp per cup", time: "2–3 min" },
    bestFor: ["shop", "stall", "home"],
    variants: [v(250, 190), v(500, 370), v(1000, 720), v(5000, 3500)],
    badge: "New",
  },
  {
    slug: "garden-reserve-whole-leaf",
    name: "Garden Reserve Whole-Leaf",
    category: "Black Tea",
    grade: "Orthodox",
    image: "/img/kraft-spill.webp",
    imageAlt: "Whole-leaf black tea spilling from a kraft pack onto a wooden board",
    focus: "45% 55%",
    tagline: "Whole twisted leaf, a clean and brisk cup.",
    description:
      "Orthodox-style leaf with a long, clean finish. Drinks beautifully without milk, which is why hotels and restaurants choose it for breakfast service and the end of a meal.",
    notes: ["Brisk", "Clean finish", "Lightly floral"],
    brew: { temp: "95°C", amount: "2 g per cup", time: "3 min" },
    bestFor: ["hotel", "restaurant", "home"],
    variants: [v(100, 160), v(250, 380), v(500, 740)],
  },
  {
    slug: "heritage-black-leaf",
    name: "Heritage Black Leaf",
    category: "Black Tea",
    grade: "Orthodox",
    image: "/img/black-leaf.webp",
    imageAlt: "Close view of dark, rolled black tea leaf",
    focus: "35% 50%",
    tagline: "Dark, rolled leaf with a deep, round cup.",
    description:
      "Slow-withered and tightly rolled, this leaf gives a smooth, round cup with a long finish. Brews well twice, so a pot goes a long way at the table.",
    notes: ["Smooth", "Round", "Malty"],
    brew: { temp: "95°C", amount: "2 g per cup", time: "3–4 min" },
    bestFor: ["restaurant", "hotel", "home"],
    variants: [v(250, 340), v(500, 660), v(1000, 1280)],
  },
  {
    slug: "pan-fired-green-leaf",
    name: "Pan-Fired Green Leaf",
    category: "Green Tea",
    grade: "Whole leaf",
    image: "/img/green-bowl.webp",
    imageAlt: "Pale amber green tea in a stoneware bowl surrounded by leaf",
    focus: "50% 50%",
    tagline: "Soft, grassy and gently sweet.",
    description:
      "Pan-fired to lock in a fresh, toasty sweetness. A light cup for anyone stepping away from milk tea, and an easy add to a hotel or restaurant tea menu.",
    notes: ["Grassy", "Toasty", "Light"],
    brew: { temp: "80°C", amount: "2 g per cup", time: "2 min" },
    bestFor: ["home", "hotel", "restaurant"],
    variants: [v(50, 120), v(100, 230), v(250, 550)],
  },
  {
    slug: "evening-calm",
    name: "Evening Calm",
    category: "Specialty",
    grade: "Low-astringency black",
    image: "/img/bowl-teapot.webp",
    imageAlt: "Steaming tea in a ceramic bowl beside a white teapot",
    focus: "40% 55%",
    tagline: "Mellow and soft for slow evenings.",
    description:
      "A gentle black tea picked for its low astringency. Pour it after dinner, or when guests stay late. Soft enough to drink without sugar.",
    notes: ["Mellow", "Soft", "Low astringency"],
    brew: { temp: "90°C", amount: "2 g per cup", time: "3 min" },
    bestFor: ["home", "restaurant"],
    variants: [v(100, 150), v(250, 360)],
  },
  {
    slug: "stall-dust-tea",
    name: "Everyday Stall Dust Tea",
    category: "Black Tea",
    grade: "Dust",
    image: "/img/cup-steam.webp",
    imageAlt: "White cup of steaming tea beside a wooden spoon of fine tea",
    focus: "55% 55%",
    tagline: "Strong, fast, and consistent all day.",
    description:
      "Fine-grade tea that gives a deep, strong liquor in minutes. Packed in 5 kg and 25 kg sacks so a busy stall never runs dry, and priced to keep the margin on your cup.",
    notes: ["Strong", "Fast colour", "Consistent"],
    brew: { temp: "100°C", amount: "1 tsp per cup", time: "2 min" },
    bestFor: ["stall", "shop"],
    variants: [v(1000, 560), v(5000, 2700), v(25000, 13000)],
    badge: "Wholesale favourite",
  },
];

export const CATEGORIES: ("All" | Category)[] = ["All", "Black Tea", "Green Tea", "Specialty"];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const getVariant = (p: Product, id: string) => p.variants.find((x) => x.id === id);
export const fromPrice = (p: Product) => Math.min(...p.variants.map((x) => x.price));
export const perKg = (variant: Variant) =>
  Math.round((variant.price / variant.grams) * 1000);
