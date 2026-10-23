"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Boxes, Check, Leaf, Package, Repeat, Sparkles, Store, Tag, Truck } from "lucide-react";
import { useState } from "react";
import { Photo } from "@/components/media/Photo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Alert, Reveal, SectionHeading } from "@/components/ui/misc";
import { ProductGrid } from "@/components/product/ProductGrid";
import { categories, products } from "@/data/demo/catalog";
import { journal } from "@/data/demo/content";
import { isEmail } from "@/lib/format";
import { fadeUp, reveal, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { firebaseConfigured } from "@/lib/firebase/client";
import { subscribeNewsletter } from "@/lib/firebase/services";

/* ── D. Trust strip ───────────────────────────────────────── */
const values = [
  { icon: Leaf, title: "Authentic Bangladeshi tea", body: "Sourced from tea gardens across Bangladesh." },
  { icon: Sparkles, title: "Carefully processed", body: "Handled with care before it reaches you." },
  { icon: Package, title: "Thoughtful packaging", body: "Packs sized for homes and for business." },
  { icon: Store, title: "Retail & wholesale supply", body: "One brand for your kitchen or your counter." },
];

export function ValueStrip() {
  return (
    <section aria-label="Why Cha Nir" className="border-y border-line bg-paper">
      <motion.ul
        {...reveal}
        variants={stagger(0.08)}
        className="container-x grid grid-cols-1 gap-x-8 gap-y-6 py-8 sm:grid-cols-2 lg:grid-cols-4"
      >
        {values.map((v) => (
          <motion.li key={v.title} variants={fadeUp} className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-tea-100 text-tea-600">
              <v.icon className="size-6" aria-hidden />
            </span>
            <div>
              <h3 className="font-semibold text-tea-900">{v.title}</h3>
              <p className="text-sm text-ink-soft">{v.body}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}

/* ── E. Shop by category ──────────────────────────────────── */
export function CategoryGrid() {
  return (
    <section className="section-y" aria-labelledby="cat-title">
      <div className="container-x">
        <SectionHeading
          eyebrow="Shop by category"
          title={<span id="cat-title">Find your kind of tea</span>}
          body="From a slow weekend pot to a counter that never stops pouring."
        />
        <motion.ul {...reveal} variants={stagger(0.08)} className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-6">
          {categories.map((c, i) => (
            <motion.li key={c.id} variants={fadeUp} className={cn("col-span-1", i < 2 ? "md:col-span-3" : "md:col-span-2", i === 4 && "col-span-2 md:col-span-2")}>
              <Link
                href={`/shop?category=${c.slug}`}
                className={cn("group relative block aspect-[4/5] overflow-hidden rounded-card", i < 2 ? "md:aspect-[4/3]" : "md:aspect-[4/5]", i === 4 && "max-md:aspect-[16/9]")}
              >
                <div className="absolute inset-0 transition-transform duration-700 ease-out-quint group-hover:scale-[1.05]">
                  <Photo image={c.image} fill rounded={false} seed={i + 2} sizes="(min-width:1024px) 33vw, 50vw" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-tea-950/80 via-tea-950/15 to-transparent" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                  <div>
                    <h3 className="font-display text-2xl leading-tight text-white sm:text-3xl">{c.name}</h3>
                    <p className="mt-1 hidden text-sm text-white/80 sm:block">{c.blurb}</p>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cream text-tea-800 transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                    <ArrowRight className="size-5" />
                  </span>
                </div>
                <span className="sr-only">Shop {c.name}</span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

/* ── F. Bestsellers ───────────────────────────────────────── */
/* ── F. Bestsellers & Botanical Vault ───────────────────────────── */
export function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredItems = products.filter((p) => {
    if (activeTab === "all") return p.featured || p.bestseller;
    return p.categoryId === activeTab;
  }).slice(0, 4);

  const tabs = [
    { id: "all", label: "All Curated Harvests" },
    { id: "cat-premium", label: "Orthodox Black" },
    { id: "cat-green", label: "Single-Origin Green" },
    { id: "cat-blends", label: "Specialty Blends" },
  ];

  return (
    <section className="section-y bg-paper" aria-labelledby="feat-title">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Botanical Flavor Vault & Harvests"
            title={<span id="feat-title">A Better Cup Starts Here</span>}
            body="Inspect single-origin terroir notes, cupping scores, and liquor profiles directly on each card."
          />
          <Button href="/shop" variant="secondary" iconRight={<ArrowRight className="size-4" aria-hidden />}>
            View Full Vault ({products.length})
          </Button>
        </div>

        {/* Botanical Filter Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-tea-900 text-cream shadow-xs"
                    : "bg-cream/80 text-ink-soft hover:bg-cream hover:text-tea-900 border border-tea-900/10",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <ProductGrid items={filteredItems} className="mt-8" />
        <p className="mt-8 text-xs text-ink-mute">
          100% Organic single-origin loose leaf • Nitrogen-flushed packaging • Direct from Sylhet & Panchagarh.
        </p>
      </div>
    </section>
  );
}

/* ── H. Wholesale ─────────────────────────────────────────── */
const wholesaleFeatures = [
  { icon: Tag, label: "Configurable wholesale pricing" },
  { icon: Boxes, label: "Bulk packs and minimum quantities" },
  { icon: Repeat, label: "Repeat orders" },
  { icon: Truck, label: "Delivery options set by the business" },
];

export function WholesaleBanner() {
  return (
    <section className="relative overflow-hidden bg-tea-900 text-cream" data-surface="dark" aria-labelledby="ws-title">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-tea-800" />
      <div className="container-x relative grid items-center gap-12 py-20 lg:grid-cols-12 lg:py-28">
        <Reveal className="lg:col-span-6">
          <p className="t-eyebrow text-lime-300">Wholesale</p>
          <h2 id="ws-title" className="t-h1 mt-4 text-balance">
            Your Tea Business Deserves a <em className="text-lime-300">Better Supply.</em>
          </h2>
          <p className="t-lead mt-5 max-w-xl text-cream/80 text-pretty">
            Explore packaged tea and bulk supply options designed for businesses that serve tea every day.
          </p>
          <p className="mt-6 text-sm font-semibold text-cream/90">Tea stalls · Tea shops · Hotels · Restaurants · Retailers &amp; resellers</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {wholesaleFeatures.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-[0.95rem]">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-lime-300">
                  <f.icon className="size-[1.1rem]" aria-hidden />
                </span>
                {f.label}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-cream/60">Available features depend on the business&rsquo;s configuration.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="/wholesale#inquiry" variant="accent" size="lg">
              Request Wholesale Pricing
            </Button>
            <Button href="/shop?category=bulk-tea" variant="light" size="lg" iconRight={<ArrowUpRight className="size-5" aria-hidden />}>
              Explore Bulk Products
            </Button>
          </div>
        </Reveal>
        <Reveal className="lg:col-span-6" delay={0.1}>
          <div className="grid grid-cols-5 gap-3">
            <Photo image={{ kind: "bulk", tone: "deep", alt: "Bulk tea packs ready for supply" }} ratio="4/5" className="col-span-3" sizes="(min-width:1024px) 30vw, 60vw" seed={4} />
            <div className="col-span-2 grid gap-3">
              <Photo image={{ kind: "stall", tone: "warm", alt: "Tea served at a tea stall" }} ratio="1/1" sizes="(min-width:1024px) 20vw, 40vw" seed={6} />
              <Photo image={{ kind: "glass", tone: "warm", alt: "Glass of tea" }} ratio="1/1" sizes="(min-width:1024px) 20vw, 40vw" seed={8} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── I. Reviews (placeholder, verified-only) ──────────────── */
export function ReviewsSection() {
  return (
    <section className="section-y" aria-labelledby="rev-title">
      <div className="container-x">
        <SectionHeading
          eyebrow="Customer reviews"
          title={<span id="rev-title">What customers say</span>}
          body="Verified reviews from people who bought and brewed our tea will appear here."
        />
        <motion.ul {...reveal} variants={stagger(0.08)} className="mt-10 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <motion.li key={n} variants={fadeUp} className="flex min-h-48 flex-col justify-between rounded-card border border-dashed border-tea-400 bg-paper p-6">
              <div>
                <p className="font-display text-5xl leading-none text-tea-300" aria-hidden>&ldquo;</p>
                <p className="mt-2 text-ink-soft">Placeholder: a verified customer review will be displayed in this space.</p>
              </div>
              <p className="mt-6 text-sm font-semibold text-ink-mute">Verified review slot {n}</p>
            </motion.li>
          ))}
        </motion.ul>
        <div className="mt-6">
          <Alert tone="info" title="Placeholder content">
            No testimonials are shown until real, verified reviews exist. Connect reviews to completed orders in Firestore.
          </Alert>
        </div>
      </div>
    </section>
  );
}

/* ── J. Tea journal ───────────────────────────────────────── */
export function JournalPreview() {
  return (
    <section className="section-y bg-paper" aria-labelledby="jrn-title">
      <div className="container-x">
        <SectionHeading
          eyebrow="Tea journal"
          title={<span id="jrn-title">Brewing, culture &amp; care</span>}
          action={<Button href="/journal" variant="secondary" iconRight={<ArrowRight className="size-4" aria-hidden />}>All articles</Button>}
        />
        <motion.ul {...reveal} variants={stagger(0.08)} className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {journal.map((a, i) => (
            <motion.li key={a.slug} variants={fadeUp}>
              <article className="group">
                <Link href={`/journal/${a.slug}`} className="block overflow-hidden rounded-card" tabIndex={-1} aria-hidden>
                  <div className="transition-transform duration-700 ease-out-quint group-hover:scale-[1.045]">
                    <Photo image={a.image} ratio="4/3" rounded={false} seed={i + 9} sizes="(min-width:1024px) 22vw, 50vw" />
                  </div>
                </Link>
                <p className="t-eyebrow mt-5 text-tea-600">{a.category} <span className="text-ink-mute">· {a.readingTime}</span></p>
                <h3 className="mt-3 font-display text-[1.4rem] leading-snug text-tea-900">
                  <Link href={`/journal/${a.slug}`} className="underline-offset-4 decoration-lime-500 decoration-2 hover:underline">{a.title}</Link>
                </h3>
                <p className="mt-2 text-sm text-ink-soft">{a.excerpt}</p>
              </article>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

/* ── K. Newsletter ────────────────────────────────────────── */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "loading" | "done">("idle");

  return (
    <section className="section-y" aria-labelledby="nl-title">
      <div className="container-x">
        <div className="grid items-center gap-8 rounded-xl bg-tea-100 p-8 sm:p-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="t-eyebrow text-tea-600">Newsletter</p>
            <h2 id="nl-title" className="t-h2 mt-3 text-balance text-tea-900">Tea notes, in your inbox.</h2>
            <p className="mt-3 max-w-md text-ink-soft">New teas, brewing tips and wholesale updates. Occasional, never noisy.</p>
          </div>
          {state === "done" ? (
            <Alert tone="success" live title={firebaseConfigured ? "You're on the list" : "You're on the list (prototype)"}>
              {firebaseConfigured
                ? "Thank you for subscribing! Your email has been saved and you'll receive updates on new teas and brewing guides."
                : "In the live site this would save your email to Firestore and send a confirmation. No email was sent from this prototype."}
            </Alert>
          ) : (
            <form
              noValidate
              onSubmit={async (e) => {
                e.preventDefault();
                if (!isEmail(email)) return setState("error");
                setState("loading");
                try {
                  await subscribeNewsletter(email, "home_newsletter");
                  setState("done");
                } catch (err) {
                  console.error("Newsletter subscription error:", err);
                  setState("error");
                }
              }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <Input
                  className="flex-1"
                  label="Email address"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (state === "error") setState("idle");
                  }}
                  required
                  error={state === "error" ? "Enter a valid email address, like name@example.com." : undefined}
                />
                <Button type="submit" size="lg" loading={state === "loading"} className="sm:mt-[1.65rem]" iconRight={<Check className="size-4" aria-hidden />}>
                  Subscribe
                </Button>
              </div>
              <p className="mt-3 text-xs text-ink-mute">
                We use your email only to send Cha Nir updates. Unsubscribe any time. See our <Link href="/policies/privacy" className="underline underline-offset-2">privacy policy</Link>.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
