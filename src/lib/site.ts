/** Site-wide configuration. Anything marked PLACEHOLDER must be replaced with real business info. */
export const site = {
  name: "Cha Nir",
  tagline: "Pure • Organic • Deshi",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Authentic Bangladeshi tea, carefully sourced, thoughtfully processed and packed for every tea moment. Retail and wholesale.",
  /** PLACEHOLDER contact details. */
  contact: {
    phone: "+880 1XXX-XXXXXX",
    whatsapp: "+880 1XXX-XXXXXX",
    email: "hello@example.com",
    address: "Business address to be added",
  },
  /** PLACEHOLDER social links; leave empty to hide. */
  social: [
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "YouTube", href: "#" },
  ],
  /**
   * Editable announcement. Set `message` to null to hide the bar entirely.
   * Never hardcode a promotion that is not confirmed by the business.
   */
  announcement: {
    message: "Prototype preview · demo catalogue & prices",
    href: "/wholesale",
    cta: "Wholesale",
  },
  nav: [
    { label: "Shop Tea", href: "/shop" },
    { label: "Wholesale", href: "/wholesale" },
    { label: "Our Story", href: "/story" },
    { label: "Tea Journal", href: "/journal" },
  ],
  payments: {
    cod: { enabled: true, label: "Cash on Delivery", note: "Pay when your order arrives." },
    gateway: {
      enabled: true,
      label: "Online payment",
      note: "Local payment gateway (bKash / Nagad / card), connected when enabled by the business.",
    },
  },
} as const;

export const policyLinks = [
  { label: "Delivery policy", href: "/policies/delivery" },
  { label: "Returns & refunds", href: "/policies/returns" },
  { label: "Privacy policy", href: "/policies/privacy" },
  { label: "Terms & conditions", href: "/policies/terms" },
];
