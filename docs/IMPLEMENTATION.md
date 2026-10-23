# Cha Nir: Implementation notes

Stack: Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4 · Motion for React (`motion/react`) · Three.js + React Three Fiber + drei · Firebase (Auth, Firestore) · Cloudinary.

Run: `npm install` then `npm run dev` (http://localhost:3000). Without `.env.local` the app runs in **demo mode**.

## What is real vs. prototype

| Area | State | Needs backend work |
|---|---|---|
| Design system, all storefront / account / admin screens | Built, responsive, accessible | - |
| Catalogue, categories, journal, orders, admin data | **Demo data** in `src/data/demo/*` | Replace with Firestore repositories |
| Cart, discount codes, delivery fee | Works client-side (localStorage) | Re-price and validate server-side; real discount rules; real delivery config |
| Checkout / order confirmation | Full UI flow with validation, loading, failure, success | `POST /api/orders` server action: re-validate cart, decrement stock transactionally, write order, create gateway session |
| Online payment | Simulated (incl. failure state) | Integrate a local gateway (e.g. bKash / Nagad / SSLCommerz) server-side + webhook |
| Auth | Firebase email/password when env vars set; demo session otherwise | Admin custom claim, email verification, password policy |
| Wholesale inquiry, newsletter | Validated forms, success state | Server route + Firestore write + notification + spam protection |
| Admin | Interactive UI on demo data | Auth guard (`admin` claim), server writes, audit log |
| Imagery | Designed SVG placeholders (`ArtImage`) | Upload real photography to Cloudinary and set `image.src` |
| Pricing / delivery / discounts / ratings | **Placeholders**, labelled "Demo" | Real values from the business. No fabricated reviews or certifications |

## Architecture
```
src/app/(shop)/…   storefront (server components by default; client islands where interactive)
src/app/(admin)/   admin (desktop-first)
src/components/    ui · layout · media · home · product · cart · shop · checkout · wholesale · account · admin · three
src/context/       cart-store, auth-store  (useSyncExternalStore: hydration-safe, no provider needed)
src/data/demo/     all fabricated data, isolated and labelled
src/lib/           motion tokens · format · site config · cloudinary · firebase client
```
- **Data layer swap:** components read from `src/data/demo/catalog.ts` helpers (`products`, `productBySlug`, …). Replace those with async repository functions using `"use cache"` + `cacheLife` (catalogue) and revalidate with `revalidateTag` from admin writes.
- **Cache Components:** route params are read inside `<Suspense>` (see `shop/[slug]/page.tsx`); `useSearchParams` consumers are wrapped in Suspense (`/shop`, `/account/login`).
- **Images:** `<Photo image={{ src, kind, alt }}>` is the only image entry point. With `src` (Cloudinary public id) it renders `next/image` with the Cloudinary loader (`f_auto,q_auto,w_*`); without, a placeholder. Aspect ratio is always reserved, so no layout shift.
- **Secrets:** only `NEXT_PUBLIC_*` public config is used client-side. Cloudinary signing and Firebase Admin must live in route handlers / server actions; see `.env.example`.

## Firestore model (proposed)
`products/{id}` (variants[], prices, stock, categoryId, media) · `categories/{id}` · `wholesalePrices/{variantId}` · `users/{uid}` (+ `addresses/*`, `wholesale: none|pending|approved`) · `orders/{id}` · `wholesaleInquiries/{id}` · `discounts/{code}` · `settings/{announcement|delivery|wholesale|homepage}`. Draft rules: `firestore.rules`.

## Motion (Motion for React)
Tokens in `src/lib/motion.ts`: one easing curve, 0.16 / 0.3 / 0.6 s, `fadeUp`, `stagger`, `reveal` (once-only `whileInView`), `panelRight|Bottom`, `press`.
Implemented: hero entrance, staggered section/product reveals, product-image hover scale (CSS transform), button hover/tap, animated cart count, cart drawer + mobile menu + filter sheet transitions, accordion/filter-chip height transitions, `layoutId` variant selection and cart-line layout, add-to-cart toast + live region, checkout step transitions. `MotionConfig reducedMotion="user"` plus a CSS guard disable movement for users who prefer reduced motion; every interaction still works.

## 3D (Three.js · R3F · drei)
Principles: HTML owns all text, CTAs, prices and forms. 3D is a layered enhancement with a static fallback in the DOM first.

| Piece | Files | Behaviour |
|---|---|---|
| Hero: tea ritual | `three/tea/*` | Photoreal-style 9-12 s story loop. See "Tea ritual hero" below. |
| Product viewer | `three/ProductViewer.tsx`, `ViewerScene.tsx` | Opt-in ("View in 3D") so nothing downloads unless asked. Drag-rotate (horizontal; vertical scroll preserved on touch), button zoom (no wheel capture), reset, variant-size scaling, loading + error boundary + static image fallback. |

Test hooks: `?3d=off` forces the fallback, `?3d=on` skips device heuristics.

### Tea ritual hero (`src/components/three/tea/`)
**The animation is scroll-driven.** The hero is a 340svh section with a sticky stage; scroll progress (Motion `useScroll`) sets a target time and the shared clock eases toward it, so the ritual scrubs forward and backward and never hijacks scrolling. Reduced-motion / no-WebGL / constrained devices get a normal-height hero with the static poster (the time-based loop still exists for `?tea_t` and capture use).

A real-time scene: a Cha Nir carton opens, loose leaves pour into a glass of hot water, the water infuses to dark amber-black tea, steam rises, hold, dissolve, repeat (loop 12.6 s: ~8 s story, ~3.7 s hold on the final composition).

| File | Role |
|---|---|
| `timeline.ts` | **The only clock.** Every pose is a pure function of loop time `t`: box pose, flap angles, each leaf's trajectory, infusion, steam amount, camera path, dissolve opacity. Frame drops cannot desynchronise anything. |
| `TeaScene.tsx` | R3F canvas + `Director` (advances `t` with a clamped delta, applies the dissolve, honours pause, starts only when the scene is ready). |
| `TeaBox.tsx` | Carton from paperboard-thickness rounded panels, printed front texture drawn from the unmodified logo, 4 hinged flaps (front tuck → sides → main lid with a damped settle), static leaf heap that lowers as it empties. |
| `TeaLeafSystem.tsx` | 3 instanced "hero" leaf silhouettes (curled/bent/twisted, 30 leaves) + 1 instanced low-poly flake mesh (150, 60 on phones). 4 draw calls. |
| `TeaGlass.tsx` | One lathe with real wall/base thickness, transparent PBR + fresnel injected via `onBeforeCompile`. No transmission pass (too costly on phones). |
| `TeaLiquid.tsx` + `TeaInfusionShader.ts` | One continuous liquid shader (see trade-offs). |
| `TeaSteamSystem.tsx` | 2-4 thin crossed ribbons running a domain-warped noise shader; no particles. |
| `TeaLighting.tsx`, `TeaCamera.tsx` | Warm key (sweeps across the pack in the intro), cool fill, rim; baked Lightformer environment (no HDR download); camera path from the timeline + desktop pointer parallax. |
| `TeaHero.tsx`, `HeroContent.tsx`, `HeroFallback.tsx` | HTML layout, gating (WebGL / device / reduced motion / off-screen / pause button), static poster. |

**Physics (documented trade-off):** leaves are not run through a rigid-body engine. Each leaf follows an analytic ballistic arc from the box lip, solved to land inside the cup (so it can never pass through the glass), tumbles while falling, floats briefly, then sinks and settles with a slerp to a flat resting pose. Water ripples are driven by the same impact list. This is deterministic, cheap and frame-rate independent.

**Infusion (documented trade-off):** no fluid solver. Tea density is a procedural 3D field: plumes that start at each early leaf impact and spread/trail downward, a global infusion ramp, and a dark bed near the floor, all broken up by fbm noise. The ray is marched through the cup (3-4 samples) with Beer-Lambert absorption (blue absorbed first), so the colour moves clear → golden → amber → deep red-brown; centre is darker (long path), edges warmer. Composited with one scalar alpha so it equals `page background x transmittance` without negative colours.

**Static fallback:** `public/hero/tea-ritual-wide.webp` and `tea-ritual-square.webp` are frames of the final composition captured from this same scene (transparent webp over the sage disc). They are the LCP image, shown whenever 3D is not rendered (no WebGL, low-end/data-saver, `prefers-reduced-motion`, still loading). To regenerate after changing the scene: open `/?3d=on&tea_t=10.2&capture=1&tea_dpr=1.5` at the target viewport (1440 wide for wide, 639 wide for square), call `window.__teaCapture()` in the console and convert the PNG data URL to webp (alpha preserved).

**Debug query params:** `tea_t=<sec>` freezes the timeline (e.g. 2.7 opening, 4.6 pour, 7 infusing, 10.2 final), `tea_off=liquid,steam,glass,leaves,box,shadow,env,contact` disables parts for profiling, `tea_dpr=<n>` forces pixel ratio, `capture` exposes `__teaCapture`.

**Performance notes:** 3D chunk loads after idle; renders only while on screen; phones (`<768px` or `<=4` cores) get fewer leaves, 2 steam ribbons, 3 march steps, DPR <= 1.25, no antialias, no pointer parallax; contact shadows are one 256px (128px on phones) pass. Measured 120 fps (display-capped) on an RTX 3050 at 1440x820 in dev; **not yet measured on a mid-range Android device**, so profile with `tea_off` there first and lower leaf counts / `steps` if needed.

**Adding an approved model:** export a GLB (Draco/Meshopt + KTX2 textures, < ~1.5 MB, < 30k tris), place it in `public/models/` or Cloudinary raw, set `viewer: { modelUrl: "/models/pack.glb" }` on the product. `ViewerScene` already loads it with `useGLTF`; add `useGLTF.preload` for above-the-fold use. Use `gltf-transform optimize` in the pipeline. Dispose of custom textures you create manually.

**Performance checklist:** no real-time shadows or post-processing; ≤ 64 lathe segments; shared geometry/materials; one animation loop per canvas (the rig owns the camera); off-screen pause; verify on a mid-range Android phone with `?3d=on` and Chrome remote debugging, and watch INP/LCP with Lighthouse.

## Homepage story (GSAP)
The homepage is a dark, cinematic scroll story followed by a cream "shop" half. `src/components/story/`: `SmoothScroll` (Lenis on GSAP's ticker; disabled for reduced motion), `Manifesto` (pinned, words light up with scroll), `StoryChapters` (pinned four-chapter wipe: sourcing → processing → packaging → sharing, using the placeholder illustrations, labelled illustrative), `CategoryReel` (pinned horizontal reel on desktop, native swipe on phones). The 3D tea ritual hero opens the story. All ScrollTriggers live in `gsap.matchMedia()` so `prefers-reduced-motion` gets a plain stacked layout. Replace the `ArtImage` stills with real photography/film frames when available (no generated video is used).

## Hero scroll story: pour, brew, sip
The scroll timeline (`timeline.ts`, `T_SIP_END` = 16.2 s) now continues after the ritual: the camera pulls back, a stylised elder (`TeaElder.tsx`, primitives only, white beard and skullcap) appears behind a timber table (`TeaTable.tsx`), reaches for the glass with two-bone IK arms, and lifts it to sip (eyes close, head tips back). `CupRig.tsx` carries glass, tea, floating leaves and steam together as one rigid body while it is lifted. Posters in `public/hero/` are frames at `T_POSTER` (15.8 s). `HeroNature.tsx` adds the sun-wash, grain and slowly swaying branch shadows behind the hero.

## Accessibility
Skip link, landmarks, semantic heading order, labelled controls with inline errors (`aria-invalid`, `aria-describedby`, `role=alert`), focus moved to the first error / step heading, `Sheet` = `role=dialog` + focus trap + Escape + scroll lock + focus return, `aria-live` cart announcements, 44px+ targets, visible focus ring, `aria-current` navigation, status never conveyed by colour alone, reduced-motion support, decorative 3D/SVG is `aria-hidden` with a text alternative on the container.

## Before launch
1. Replace every "Demo" / placeholder (catalogue, prices, delivery, contact, social, policies, story, reviews).
2. Provide real photography via Cloudinary; add alt text.
3. Wire Firestore repositories, order creation, gateway, admin guard, form endpoints; deploy `firestore.rules` after emulator tests.
4. Verify any claim shown (organic, sourcing, certifications) with evidence before publishing.
5. Run Lighthouse + axe, test the checkout on real phones.
