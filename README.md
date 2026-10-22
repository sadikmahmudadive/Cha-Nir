# Cha Nir

Premium Bangladeshi tea e-commerce: retail + wholesale storefront, customer accounts, admin dashboard concept and a 3D hero. Next.js 16 · Tailwind v4 · Motion · React Three Fiber · Firebase · Cloudinary.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

- Storefront: `/`, `/shop`, `/shop/[slug]`, `/cart`, `/checkout`, `/wholesale`, `/story`, `/journal`
- Account: `/account/login`, `/account/register`, `/account/reset`, `/account`, `/account/orders`
- Admin (prototype): `/admin` (+ orders, products, inventory, customers, wholesale, discounts, delivery, content, reports)
- Design system reference: `/design-system`

No `.env.local` is required: the app runs in demo mode with clearly labelled placeholder data. See [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) for architecture, backend integration points, 3D guidance and the launch checklist, and `.env.example` for configuration.
