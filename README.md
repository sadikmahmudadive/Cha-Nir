# Cha Nir

Storefront for **Cha Nir**, packaged Bangladeshi tea sold wholesale and retail to tea stalls, shops, hotels, restaurants and homes.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion.

```bash
npm install
npm run dev   # http://localhost:3000
npm run build
```

## Structure

- `src/app` pages: `/`, `/shop`, `/shop/[slug]`, `/wholesale`, `/checkout`
- `src/components/home` homepage sections (hero, scroll story, audiences, tiers, FAQ)
- `src/lib/products.ts` catalogue, **placeholder prices in BDT**
- `src/lib/pricing.ts` bulk-discount tiers, delivery fee and totals
- `src/lib/cart.ts` cart store, persisted in `localStorage`
- `public/img` optimised photos and logos

## Placeholders to replace before launch

- Prices, pack sizes, bulk tiers and delivery fee (`products.ts`, `pricing.ts`)
- Product copy, tasting notes and FAQ answers
- Contact details in the footer
- Checkout and the wholesale quote form are **front-end only**: both have a `TODO` where the request should go to a backend
- `NEXT_PUBLIC_SITE_URL` for social-share links

## Design tokens

Tea Leaf Green `#536D3B`, Fresh Lime `#A5BE16`, Warm Cream `#F7F4E9`, Tea Brown `#302A23`.
Derived: `leaf-deep #2F3F21`, `leaf-soft #E4EAD6`, `cream-2 #EFEBD9`.
Lime is only used as a fill or with dark text; never as text on cream (fails contrast).
Fonts: Lora (headings), Raleway (body, matches the logo tagline), Hind Siliguri (Bangla).
