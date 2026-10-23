export interface TeaVariety {
  id: string;
  name: string;
  subtitle: string;
  estate: string;
  elevation: string;
  harvest: string;
  plucking: string;
  tastingNotes: string[];
  brewTemp: string;
  steepTime: string;
  cuppingScore: string;
  accentColor: string;
  /** Optical absorption vector: vec3(sigmaR, sigmaG, sigmaB). Determines light attenuation through liquid */
  sigma: [number, number, number];
  /** Warmth in-scatter vec3(r, g, b) */
  warmth: [number, number, number];
  slug: string;
}

export const TEA_VARIETIES: TeaVariety[] = [
  {
    id: "first-flush",
    name: "Spring First Flush",
    subtitle: "Highland Single Origin",
    estate: "Srimangal Heritage Estate",
    elevation: "1,450m ASL",
    harvest: "March Early Flush",
    plucking: "Silver Needle & Tender Bud",
    tastingNotes: ["Crisp Muscatel", "Wild Honey", "Orchid"],
    brewTemp: "85°C",
    steepTime: "3.5 min",
    cuppingScore: "93 pts",
    accentColor: "#D4A338", // Luminous honey gold
    sigma: [0.42, 1.45, 5.8], // Golden amber liquor
    warmth: [0.65, 0.45, 0.12],
    slug: "premium-black-tea-loose-leaf",
  },
  {
    id: "orthodox-black",
    name: "Artisan Orthodox Black",
    subtitle: "Traditional CTC & Orthodox",
    estate: "Malnicherra 1854 · Sylhet",
    elevation: "1,120m ASL",
    harvest: "Summer Second Flush",
    plucking: "Two Leaves & a Bud",
    tastingNotes: ["Malty Toffee", "Dried Fig", "Dark Cocoa"],
    brewTemp: "95°C",
    steepTime: "4.0 min",
    cuppingScore: "91 pts",
    accentColor: "#C25E1A", // Deep Amber Red
    sigma: [0.78, 2.5, 5.6], // Deep ruby amber
    warmth: [0.55, 0.32, 0.08],
    slug: "everyday-tea-blend",
  },
  {
    id: "valley-green",
    name: "Panchagarh Jade Needle",
    subtitle: "Organic Valley Harvest",
    estate: "Himalayan Foothills Terroir",
    elevation: "1,200m ASL",
    harvest: "Spring Solstice",
    plucking: "Young Hand-plucked Tips",
    tastingNotes: ["Sweet Grass", "Toasted Sesame", "Fresh Dew"],
    brewTemp: "75°C",
    steepTime: "2.5 min",
    cuppingScore: "90 pts",
    accentColor: "#7EA835", // Fresh Lime Green
    sigma: [2.5, 0.52, 3.4], // Luminous jade green
    warmth: [0.38, 0.54, 0.16],
    slug: "single-origin-green-tea",
  },
  {
    id: "moonlight-silver",
    name: "Moonlight Silver Tips",
    subtitle: "Reserve White Tea",
    estate: "Sylhet Rainforest Reserve",
    elevation: "1,600m ASL",
    harvest: "Handcrafted Micro-lot",
    plucking: "Sun-dried Downy Buds",
    tastingNotes: ["Honeysuckle", "White Nectarine", "Velvet"],
    brewTemp: "80°C",
    steepTime: "5.0 min",
    cuppingScore: "95 pts",
    accentColor: "#B89B68", // Champagne Silver
    sigma: [0.26, 0.9, 3.5], // Luminous delicate pale gold
    warmth: [0.62, 0.52, 0.28],
    slug: "special-reserve-blend",
  },
];
