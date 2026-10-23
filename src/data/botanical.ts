export interface BotanicalProfile {
  tastingNotes: string[];
  terroir: string;
  elevation: string;
  liquorColor: string;
  liquorName: string;
  brewSpecs: {
    temp: string;
    time: string;
    leafRatio: string;
  };
  metrics: {
    aroma: number; // 0-100
    body: number; // 0-100
    briskness: number; // 0-100
    sweetFinish: number; // 0-100
  };
}

export const BOTANICAL_PROFILES: Record<string, BotanicalProfile> = {
  "p-premium-loose": {
    tastingNotes: ["Malty Caramel", "Crisp Muscatel", "Wild Honey"],
    terroir: "Srimangal Highland Estate",
    elevation: "1,450m ASL",
    liquorColor: "#B55A1A",
    liquorName: "Deep Copper Amber",
    brewSpecs: { temp: "95°C", time: "3.5 min", leafRatio: "2.5g / 200ml" },
    metrics: { aroma: 92, body: 88, briskness: 80, sweetFinish: 86 },
  },
  "p-everyday": {
    tastingNotes: ["Toasted Malt", "Molasses", "Warm Cocoa"],
    terroir: "Sylhet Valley Terroir",
    elevation: "1,120m ASL",
    liquorColor: "#8E3812",
    liquorName: "Bold Crimson Liquor",
    brewSpecs: { temp: "98°C", time: "4.0 min", leafRatio: "3g / 200ml" },
    metrics: { aroma: 84, body: 95, briskness: 90, sweetFinish: 76 },
  },
  "p-green": {
    tastingNotes: ["Sweet Grass", "Roasted Sesame", "Morning Dew"],
    terroir: "Panchagarh Foothills Organic",
    elevation: "1,200m ASL",
    liquorColor: "#7EA835",
    liquorName: "Luminous Jade Gold",
    brewSpecs: { temp: "75°C", time: "2.5 min", leafRatio: "2g / 200ml" },
    metrics: { aroma: 89, body: 68, briskness: 72, sweetFinish: 88 },
  },
  "p-blend-masala": {
    tastingNotes: ["Cardamom Pod", "Ceylon Cinnamon", "Ginger Warmth"],
    terroir: "Artisan Mountain Blend",
    elevation: "1,350m ASL",
    liquorColor: "#9C4215",
    liquorName: "Deep Spiced Amber",
    brewSpecs: { temp: "100°C", time: "5.0 min", leafRatio: "3g / 200ml" },
    metrics: { aroma: 96, body: 92, briskness: 82, sweetFinish: 85 },
  },
  "p-gift": {
    tastingNotes: ["Floral Orchid", "Sweet Hay", "Toffee"],
    terroir: "Trio Heritage Estates",
    elevation: "1,400m ASL",
    liquorColor: "#C28526",
    liquorName: "Trio Tasting Palette",
    brewSpecs: { temp: "85°C", time: "3.0 min", leafRatio: "2.5g / 200ml" },
    metrics: { aroma: 94, body: 82, briskness: 78, sweetFinish: 90 },
  },
  "p-premium-dust": {
    tastingNotes: ["Dark Molasses", "Roasted Earth", "Bold Briskness"],
    terroir: "Sylhet Lowland Slopes",
    elevation: "850m ASL",
    liquorColor: "#70250A",
    liquorName: "Intense Mahogany",
    brewSpecs: { temp: "100°C", time: "3.0 min", leafRatio: "3g / 200ml" },
    metrics: { aroma: 80, body: 98, briskness: 95, sweetFinish: 70 },
  },
  "p-bulk-stall": {
    tastingNotes: ["Robust Malt", "Caramelized Jaggery", "Brisk"],
    terroir: "Commercial Garden Estates",
    elevation: "900m ASL",
    liquorColor: "#803010",
    liquorName: "Strong Tea-Stall Red",
    brewSpecs: { temp: "100°C", time: "4.5 min", leafRatio: "3.5g / 200ml" },
    metrics: { aroma: 82, body: 96, briskness: 92, sweetFinish: 74 },
  },
};

export function getBotanicalProfile(productId: string): BotanicalProfile {
  return (
    BOTANICAL_PROFILES[productId] ?? {
      tastingNotes: ["Malty Notes", "Floral Undertones", "Clean Finish"],
      terroir: "Artisanal Bangladesh Terroir",
      elevation: "1,250m ASL",
      liquorColor: "#A36021",
      liquorName: "Golden Amber",
      brewSpecs: { temp: "90°C", time: "3.5 min", leafRatio: "2.5g / 200ml" },
      metrics: { aroma: 85, body: 85, briskness: 80, sweetFinish: 80 },
    }
  );
}
