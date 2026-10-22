import type { Metadata } from "next";
import { Check, Inbox, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Alert, EmptyState, Price, Skeleton } from "@/components/ui/misc";
import { products } from "@/data/demo/catalog";

export const metadata: Metadata = {
  title: "Design system",
  description: "Cha Nir design tokens, components and states.",
  robots: { index: false },
};

/* WCAG contrast, computed from the actual token values. */
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const colors = [
  { name: "Tea green 600", token: "--color-tea-600", hex: "#536D3B", on: "#FFFFFF", role: "Primary actions, links" },
  { name: "Tea green 900", token: "--color-tea-900", hex: "#232F19", on: "#F7F4E9", role: "Headlines, footer" },
  { name: "Fresh lime 500", token: "--color-lime-500", hex: "#A5BE16", on: "#182011", role: "Accent, highlights (not text on light)" },
  { name: "Warm cream", token: "--color-cream", hex: "#F7F4E9", on: "#302A23", role: "Page background" },
  { name: "Muted sage", token: "--color-tea-100", hex: "#E9EEDB", on: "#34452A", role: "Surfaces, chips" },
  { name: "Dark tea brown", token: "--color-ink", hex: "#302A23", on: "#F7F4E9", role: "Body text" },
  { name: "Ink soft", token: "--color-ink-soft", hex: "#564D43", on: "#F7F4E9", role: "Secondary text" },
  { name: "Danger", token: "--color-danger", hex: "#B3261E", on: "#FFFFFF", role: "Errors" },
];

const space = [4, 8, 12, 16, 24, 32, 48, 64, 96];

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-line py-12" aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} className="t-h2 mb-8 text-tea-900">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const base = products[0];
  const discounted = { ...base, id: "ds-d", variants: base.variants.map((v) => ({ ...v, compareAt: v.compareAt ?? Math.round(v.price * 1.15) })) };
  const low = { ...products[2], id: "ds-l", variants: products[2].variants.map((v) => ({ ...v, stock: 4 })) };
  const out = { ...products[1], id: "ds-o", variants: products[1].variants.map((v) => ({ ...v, stock: 0 })) };
  const rated = { ...products[3], id: "ds-r", rating: { avg: 4.6, count: 12 } };

  return (
    <div className="container-x pb-24 pt-10">
      <header className="max-w-3xl space-y-4">
        <p className="t-eyebrow text-tea-600">Design system</p>
        <h1 className="t-display text-tea-900">Cha Nir, in tokens.</h1>
        <p className="t-lead text-ink-soft">
          Organic minimalism with editorial typography: forest green and fresh lime on warm cream. Every value below is a CSS variable in <code>globals.css</code>.
        </p>
      </header>

      <Block id="color" title="Colour">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {colors.map((c) => (
            <li key={c.token} className="overflow-hidden rounded-card border border-line bg-paper">
              <div className="flex h-24 items-end p-3" style={{ background: c.hex, color: c.on }}>
                <span className="text-sm font-bold">Aa {ratio(c.hex, c.on).toFixed(1)}:1</span>
              </div>
              <div className="space-y-0.5 p-4 text-sm">
                <p className="font-semibold">{c.name}</p>
                <p className="text-ink-mute"><code>{c.hex}</code> · <code>{c.token}</code></p>
                <p className="text-ink-soft">{c.role}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-mute">Contrast ratios are calculated from the token pairings shown. Body text pairings meet WCAG AA (4.5:1).</p>
      </Block>

      <Block id="type" title="Typography">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-5">
            <p className="t-display text-tea-900">Every Cup</p>
            <p className="t-h1 text-tea-900">Heading one</p>
            <p className="t-h2 text-tea-900">Heading two</p>
            <p className="t-h3 text-tea-900">Heading three</p>
            <p className="t-eyebrow text-tea-600">Eyebrow label</p>
            <p className="t-lead text-ink-soft">Lead paragraph in Manrope for introductions and supporting copy.</p>
            <p className="text-ink">Body text is 16px at a 1.6 line height. Product information, forms and navigation use Manrope.</p>
          </div>
          <dl className="space-y-3 text-sm">
            {[
              ["Display / headlines", "DM Serif Display, fluid clamp()"],
              ["Body, UI, forms", "Manrope 400 – 800"],
              ["Scale", "12 · 14 · 16 · 18–20 · 28 · 32–48 · 44–96"],
              ["Line height", "1.6 body · 1.1 headlines"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-line-soft pb-2"><dt className="text-ink-mute">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
            ))}
          </dl>
        </div>
      </Block>

      <Block id="space" title="Spacing, radius & shadow">
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <h3 className="mb-3 font-semibold">Spacing (px)</h3>
            <ul className="space-y-2">
              {space.map((s) => (
                <li key={s} className="flex items-center gap-3 text-sm"><span className="w-8 text-ink-mute">{s}</span><span className="h-3 rounded-sm bg-tea-400" style={{ width: s * 2 }} /></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">Radius</h3>
            <div className="flex flex-wrap gap-3">
              {[["xs", "6"], ["sm", "10"], ["md", "14"], ["card", "20"], ["xl", "28"]].map(([n, v]) => (
                <div key={n} className="grid size-20 place-items-center border-2 border-tea-600 bg-tea-100 text-xs font-semibold" style={{ borderRadius: `${v}px` }}>{n}<br />{v}px</div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">Shadow</h3>
            <div className="flex gap-4">
              <div className="grid size-24 place-items-center rounded-card bg-paper text-sm shadow-soft">soft</div>
              <div className="grid size-24 place-items-center rounded-card bg-paper text-sm shadow-lift">lift</div>
            </div>
          </div>
        </div>
      </Block>

      <Block id="motion" title="Motion rules">
        <ul className="grid gap-4 md:grid-cols-3">
          {[
            ["Timing", "150 ms micro · 300 ms UI · 600 ms reveals. One easing curve: cubic-bezier(.22, 1, .36, 1). Exits are faster than entrances."],
            ["Properties", "Only transform and opacity (height for accordions). No parallax, no looping decorative animation."],
            ["Reduced motion", "MotionConfig reducedMotion=\"user\" plus a CSS media query. All interactions work without animation."],
          ].map(([t, d]) => (
            <li key={t} className="rounded-card border border-line bg-paper p-5"><h3 className="font-display text-xl">{t}</h3><p className="mt-2 text-sm text-ink-soft">{d}</p></li>
          ))}
        </ul>
      </Block>

      <Block id="buttons" title="Buttons">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <span className="rounded-full bg-tea-900 p-1.5"><Button variant="light">On dark</Button></span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small (44px)</Button>
            <Button size="md">Medium (48px)</Button>
            <Button size="lg">Large (56px)</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </Block>

      <Block id="forms" title="Form controls & states">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Input label="Default" placeholder="Placeholder" />
          <Input label="With hint" hint="Helper text sits below the field." />
          <Input label="Error" required defaultValue="not-an-email" error="Enter a valid email address, like name@example.com." />
          <Input label="Disabled" disabled defaultValue="Can't edit" />
          <Select label="Select"><option>Option one</option><option>Option two</option></Select>
        </div>
      </Block>

      <Block id="feedback" title="Loading, error, empty, success & disabled">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <Alert tone="success" title="Success">Your changes have been saved.</Alert>
            <Alert tone="danger" title="Error">Payment didn&rsquo;t go through. You haven&rsquo;t been charged.</Alert>
            <Alert tone="warn" title="Warning">Only 4 left in this pack size.</Alert>
            <Alert tone="info" title="Info">Delivery charge is calculated at checkout.</Alert>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge>Neutral</Badge><Badge tone="green">Green</Badge><Badge tone="lime">Lime</Badge><Badge tone="warn">Warning</Badge><Badge tone="danger">Danger</Badge>
              <StatusBadge status="pending" /><StatusBadge status="delivered" /><StatusBadge status="cancelled" />
            </div>
            <p className="flex items-center gap-2 text-sm text-ink-soft"><Loader2 className="size-4 animate-spin" aria-hidden /> Loading spinner <Check className="ml-4 size-4 text-success" aria-hidden /> Success tick</p>
            <Price price={520} compareAt={600} size="lg" />
          </div>
          <div className="grid gap-4">
            <div className="rounded-card border border-line bg-paper p-5">
              <div className="flex gap-4"><Skeleton className="size-20" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" /></div></div>
            </div>
            <EmptyState icon={<Inbox className="size-7" aria-hidden />} title="Nothing here yet" body="Empty states explain what is missing and offer one clear next step." action={{ label: "Primary action", href: "/shop" }} className="rounded-card border border-dashed border-line" />
          </div>
        </div>
      </Block>

      <Block id="cards" title="Product card states">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {[
            ["Default", base],
            ["Discount", discounted],
            ["Low stock", low],
            ["Out of stock", out],
            ["Verified rating (sample)", rated],
          ].map(([label, p]) => (
            <li key={label as string}>
              <p className="mb-3 text-sm font-semibold text-ink-mute">{label as string}</p>
              <ProductCard product={p as typeof base} />
            </li>
          ))}
        </ul>
      </Block>

      <Block id="components" title="Component structure">
        <pre className="overflow-x-auto rounded-card bg-tea-950 p-6 text-sm leading-relaxed text-tea-100">{`src/
  app/(shop)/…        storefront routes (server components by default)
  app/(admin)/admin/… admin routes (client shell, demo data)
  components/
    ui/               Button, Field (Input/Select/Checkbox/Radio), Sheet (dialog/drawer),
                      Accordion, Badge, misc (Price, Rating, Quantity, Alert, Skeleton, Empty)
    layout/           Header, MobileMenu, Footer, AnnouncementBar, Providers
    product/          ProductCard, ProductGrid, ProductExperience (gallery + variants), ProductInfo
    cart/             CartDrawer, CartParts, CartPage, AddedToast
    checkout/         Checkout (3-step flow)
    shop/             ShopClient (filters, chips, drawer)
    wholesale/        InquiryForm, WholesaleCatalog
    account/          AuthForms, AccountShell, Profile, Orders
    three/            capability, tea/* (TeaHero, TeaScene, timeline…), TeaJourney, JourneyScene, ProductViewer
    admin/            AdminShell, parts (DataTable…), pages-a / pages-b
  context/            cart-store, auth-store (useSyncExternalStore)
  data/demo/          clearly labelled DEMO data (swap for Firestore repositories)
  lib/                motion, format, cloudinary, firebase client, site config`}</pre>
      </Block>
    </div>
  );
}
