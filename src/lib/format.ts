const bdt = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 0,
});

/** Format an integer amount of BDT (taka) e.g. 1250 -> "৳1,250". */
export function formatBDT(amount: number): string {
  return `৳${bdt.format(Math.round(amount))}`;
}

export function percentOff(price: number, compareAt?: number): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** Bangladesh mobile: 01XXXXXXXXX, optionally prefixed by +88 / 88. */
export const isBdPhone = (v: string) =>
  /^(?:\+?88)?01[3-9]\d{8}$/.test(v.replace(/[\s-]/g, ""));
