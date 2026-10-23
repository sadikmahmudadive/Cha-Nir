<div align="center">

<img src="public/img/logo-full.webp" alt="Cha Nir — Pure · Organic · Deshi" width="260" />

# Cha Nir

**Real Bangladeshi tea, packed for every cup.**
*খাঁটি • জৈব • দেশি*

An e-commerce storefront for authentic packaged tea from Bangladesh's best gardens, sold wholesale and retail to tea stalls, shops, hotels, restaurants and homes.

![Next.js](https://img.shields.io/badge/Next.js_16-302A23?style=flat-square&logo=nextdotjs&logoColor=F7F4E9)
![TypeScript](https://img.shields.io/badge/TypeScript-536D3B?style=flat-square&logo=typescript&logoColor=F7F4E9)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-536D3B?style=flat-square&logo=tailwindcss&logoColor=F7F4E9)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-A5BE16?style=flat-square&logo=framer&logoColor=302A23)

</div>

---

## ✨ Highlights

| | |
|---|---|
| 🍃 **Scroll story** | Five full-screen chapters, from garden to cup, driven by scroll progress with Framer Motion. |
| 🏪 **Built for buyers** | Audience tabs for stalls, shops, hotels, restaurants and homes, each with a recommended pack and teas. |
| 🛒 **Smart cart** | Slide-in drawer with persistent storage and a progress bar toward the next bulk discount. |
| 📦 **Bulk pricing** | Basket weight unlocks 5% (10 kg), 8% (25 kg) and 12% (50 kg) off, applied automatically. |
| 🤝 **Wholesale desk** | Tier table, how-it-works steps and a validated quote request form. |
| ♿ **Accessible** | Visible labels, inline errors, keyboard-friendly tabs and dialogs, and reduced-motion support. |

## 🗺️ Pages

| Route | What it does |
|---|---|
| `/` | Hero, scroll story, audiences, best sellers, bulk tiers, FAQ |
| `/shop` | Search, category and "best for" filters, sorting |
| `/shop/[slug]` | Pack-size picker, quantity, brew guide, related teas |
| `/wholesale` | Pricing tiers and quote request |
| `/checkout` | Delivery form, cash on delivery, order summary |

## 🚀 Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

Optional: set `NEXT_PUBLIC_SITE_URL` so social-share links resolve to your domain.

## 🧱 Project structure

```text
src/
├─ app/                 routes (home, shop, wholesale, checkout)
├─ components/
│  ├─ home/             hero, scroll story, audiences, tiers, FAQ
│  └─ …                 header, footer, cart drawer, product card, form field
└─ lib/
   ├─ products.ts       catalogue (placeholder BDT prices)
   ├─ pricing.ts        bulk tiers, delivery fee, totals
   └─ cart.ts           cart store persisted in localStorage
public/img/             optimised WebP logos and photos
```

## 🎨 Design system

| Token | Hex | Use |
|---|---|---|
| ![](https://img.shields.io/badge/-%20-536D3B?style=flat-square) Tea Leaf Green | `#536D3B` | Primary brand colour |
| ![](https://img.shields.io/badge/-%20-A5BE16?style=flat-square) Fresh Lime | `#A5BE16` | Accent and CTAs |
| ![](https://img.shields.io/badge/-%20-F7F4E9?style=flat-square) Warm Cream | `#F7F4E9` | Page background |
| ![](https://img.shields.io/badge/-%20-302A23?style=flat-square) Tea Brown | `#302A23` | Text and contrast |

Derived shades: `leaf-deep #2F3F21`, `leaf-soft #E4EAD6`, `cream-2 #EFEBD9`.
Lime is used only as a fill or with dark text, never as text on cream, because it fails contrast there.

**Type:** Lora for headings, Raleway for body (it matches the logo tagline) and Hind Siliguri for Bangla.

## ⚠️ Before launch

- [ ] Replace placeholder **prices, pack sizes, bulk tiers and delivery fee** (`products.ts`, `pricing.ts`)
- [ ] Review product copy, tasting notes and **FAQ answers**
- [ ] Add real **contact details** in the footer
- [ ] Connect **checkout** and the **wholesale quote form** to a backend (each has a `TODO`; they are front-end only today)
- [ ] Confirm the Modhumoti pack photo is yours to use as a product
- [ ] Set `NEXT_PUBLIC_SITE_URL`

---

<div align="center">

*Pure • Organic • Deshi*

</div>
