import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Droplets, Scale, Timer } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { PRODUCTS, SEGMENTS, getProduct } from "@/lib/products";
import { PurchasePanel } from "./PurchasePanel";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return { title: p.name, description: `${p.tagline} ${p.description}`, openGraph: { images: [p.image] } };
}

export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = PRODUCTS.filter(
    (p) => p.slug !== product.slug && p.bestFor.some((s) => product.bestFor.includes(s)),
  ).slice(0, 4);

  return (
    <div className="container-x pb-8 pt-6 lg:pt-10">
      <nav aria-label="Breadcrumb" className="text-[0.9375rem] text-brown-soft">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/shop" className="font-semibold hover:text-leaf">
              Shop
            </Link>
          </li>
          <ChevronRight className="size-4" aria-hidden />
          <li aria-current="page" className="font-semibold text-brown">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Reveal y={16}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-cream-2">
              <Image
                src={product.image}
                alt={product.imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
                style={{ objectPosition: product.focus }}
              />
              {product.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-lime px-3.5 py-1.5 text-[0.8125rem] font-bold uppercase tracking-wider">
                  {product.badge}
                </span>
              )}
            </div>
          </Reveal>
        </div>

        <div>
          <p className="eyebrow">
            {product.category} · {product.grade}
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl">{product.name}</h1>
          <p className="mt-3 font-serif text-xl italic text-leaf">{product.tagline}</p>
          <p className="mt-5 text-lg text-brown-soft">{product.description}</p>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tasting notes">
            {product.notes.map((n) => (
              <li key={n} className="rounded-full bg-leaf-soft px-3.5 py-1.5 text-[0.875rem] font-semibold text-leaf-deep">
                {n}
              </li>
            ))}
          </ul>

          <PurchasePanel product={product} />

          <section aria-labelledby="brew-h" className="card mt-10 p-6">
            <h2 id="brew-h" className="text-2xl">
              How to brew
            </h2>
            <dl className="mt-5 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: Droplets, k: "Water", v: product.brew.temp },
                { icon: Scale, k: "Tea", v: product.brew.amount },
                { icon: Timer, k: "Steep", v: product.brew.time },
              ].map(({ icon: Icon, k, v }) => (
                <div key={k}>
                  <Icon className="mx-auto size-6 text-leaf" aria-hidden />
                  <dt className="mt-2 text-[0.8125rem] font-bold uppercase tracking-wider text-brown-soft">{k}</dt>
                  <dd className="mt-0.5 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="for-h" className="mt-8">
            <h2 id="for-h" className="font-sans text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-leaf">
              Best for
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {product.bestFor.map((s) => (
                <li key={s}>
                  <Link
                    href={`/shop?for=${s}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-line bg-[#fffdf6] px-4 text-[0.9375rem] font-semibold transition-colors hover:border-leaf hover:text-leaf"
                  >
                    {SEGMENTS[s].plural}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="rel-h" className="mt-24">
          <h2 id="rel-h" className="text-3xl sm:text-4xl">
            Pairs well with your order
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
