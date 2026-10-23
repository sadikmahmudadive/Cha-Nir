"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { cartActions } from "@/lib/cart";
import { bdt } from "@/lib/pricing";
import { fromPrice, type Product } from "@/lib/products";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const [added, setAdded] = useState(false);
  const quick = product.variants[Math.min(1, product.variants.length - 1)];

  const add = () => {
    cartActions.add(product.slug, quick.id, 1, false);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-[#fffdf6] shadow-[0_1px_0_rgb(0_0_0/0.02)] transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgb(48_42_35/0.35)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream-2">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 92vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ objectPosition: product.focus }}
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-lime px-3 py-1 text-[0.75rem] font-bold uppercase tracking-wider text-brown">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-leaf">
            {product.category} · {product.grade}
          </p>
          <h3 className="mt-1 text-xl leading-tight">
            <Link
              href={`/shop/${product.slug}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1.5 text-[0.9375rem] text-brown-soft">{product.tagline}</p>
        </div>

        <ul className="flex flex-wrap gap-1.5" aria-label="Tasting notes">
          {product.notes.map((n) => (
            <li
              key={n}
              className="rounded-full bg-leaf-soft px-2.5 py-1 text-[0.75rem] font-semibold text-leaf-deep"
            >
              {n}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-[0.75rem] text-brown-soft">From</p>
            <p className="font-bn text-2xl font-bold leading-none tabular-nums">
              {bdt(fromPrice(product))}
            </p>
          </div>
          <button
            type="button"
            onClick={add}
            aria-label={`Add ${quick.label} ${product.name} to cart`}
            className="btn btn-leaf relative z-10 gap-1.5 px-4"
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span
                  key="ok"
                  className="inline-flex items-center gap-1.5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Check className="size-4" aria-hidden /> Added
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  className="inline-flex items-center gap-1.5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Plus className="size-4" aria-hidden /> {quick.label}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.article>
  );
}
