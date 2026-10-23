import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Reveal, SplitHeading } from "@/components/Reveal";
import { getProduct } from "@/lib/products";

const PICKS = [
  "chai-ready-premium-loose",
  "modhumoti-gold",
  "garden-reserve-whole-leaf",
  "stall-dust-tea",
];

export function Featured() {
  const products = PICKS.flatMap((s) => {
    const p = getProduct(s);
    return p ? [p] : [];
  });
  return (
    <section className="bg-cream-2 py-24 lg:py-32" aria-labelledby="feat-h">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <p className="eyebrow">Best sellers</p>
            </Reveal>
            <SplitHeading
              text="Start with what everyone reorders."
              className="mt-3 max-w-2xl text-4xl sm:text-5xl"
            />
            <h2 id="feat-h" className="sr-only">
              Best selling teas
            </h2>
          </div>
          <Reveal>
            <Link href="/shop" className="btn btn-ghost group">
              View all teas
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
