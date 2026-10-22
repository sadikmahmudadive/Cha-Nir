"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { cartActions } from "@/context/cart-store";
import { hashSeed } from "@/components/media/ArtImage";
import { Photo } from "@/components/media/Photo";
import { Badge } from "@/components/ui/Badge";
import { Price, Rating } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { categoryById, defaultVariant } from "@/data/demo/catalog";
import { cn } from "@/lib/cn";
import { stockState, type Product } from "@/types/catalog";

/**
 * Reusable product card. Everything visible is driven by props from the
 * product record: image, name, short copy, pack sizes, BDT price (+ optional
 * compare-at/discount), stock state, optional verified rating, quick-add.
 */
export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const [vid, setVid] = useState(() => defaultVariant(product).id);
  const [added, setAdded] = useState(false);
  const variant = product.variants.find((v) => v.id === vid) ?? product.variants[0];
  const stock = stockState(variant.stock);
  const cat = categoryById(product.categoryId);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <article className="group flex h-full flex-col" aria-labelledby={`pc-${product.id}`}>
      <div className="relative">
        <Link href={`/shop/${product.slug}`} className="block overflow-hidden rounded-card" tabIndex={-1} aria-hidden>
          <div className="transition-transform duration-700 ease-out-quint group-hover:scale-[1.045]">
            <Photo image={product.image} ratio="4/5" sizes="(min-width:1280px) 22vw, (min-width:768px) 33vw, 50vw" priority={priority} rounded={false} seed={hashSeed(product.id)} />
          </div>
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.badge && <Badge tone={product.badge === "New" ? "lime" : "dark"}>{product.badge}</Badge>}
          {stock === "out" && <Badge tone="neutral">Out of stock</Badge>}
          {stock === "low" && <Badge tone="warn">Only {variant.stock} left</Badge>}
        </div>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-cream/85 px-2 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-ink-mute">
          Demo
        </span>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-2.5">
        <p className="t-eyebrow text-tea-600">{cat?.name}</p>
        <h3 id={`pc-${product.id}`} className="font-display text-[1.4rem] leading-tight text-tea-900">
          <Link href={`/shop/${product.slug}`} className="hover:underline decoration-lime-500 decoration-2 underline-offset-4">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-[0.93rem] leading-snug text-ink-soft">{product.short}</p>
        {product.rating && <Rating {...product.rating} />}

        {product.variants.length > 1 ? (
          <fieldset className="mt-0.5">
            <legend className="sr-only">Pack size for {product.name}</legend>
            <div className="flex flex-wrap gap-1.5">
              {product.variants.map((v) => (
                <label key={v.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name={`pack-${product.id}`}
                    value={v.id}
                    checked={v.id === vid}
                    onChange={() => setVid(v.id)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "inline-flex min-h-9 items-center rounded-full border px-3 text-[0.82rem] font-semibold transition-colors",
                      "border-line text-ink-soft hover:border-tea-500",
                      "peer-checked:border-tea-600 peer-checked:bg-tea-600 peer-checked:text-white",
                      "peer-focus-visible:outline-3 peer-focus-visible:outline-lime-500 peer-focus-visible:outline-offset-2",
                      v.stock <= 0 && "line-through opacity-60",
                    )}
                  >
                    {v.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <p className="text-sm font-semibold text-ink-soft">{variant.label}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <Price price={variant.price} compareAt={variant.compareAt} />
        </div>

        <Button
          full
          size="sm"
          variant={added ? "accent" : "primary"}
          disabled={stock === "out"}
          onClick={() => {
            if (cartActions.add(product, variant, 1)) setAdded(true);
          }}
          aria-label={stock === "out" ? `${product.name} ${variant.label} is out of stock` : `Add ${product.name}, ${variant.label}, to cart`}
          iconLeft={
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={added ? "ok" : "bag"} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.16 }} className="grid">
                {added ? <Check className="size-4" strokeWidth={3} aria-hidden /> : <ShoppingBag className="size-4" aria-hidden />}
              </motion.span>
            </AnimatePresence>
          }
        >
          {stock === "out" ? "Out of stock" : added ? "Added" : "Quick add"}
        </Button>
      </div>
    </article>
  );
}
