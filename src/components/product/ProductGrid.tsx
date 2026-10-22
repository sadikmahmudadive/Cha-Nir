"use client";

import { motion } from "motion/react";
import { reveal, fadeUp, stagger } from "@/lib/motion";
import type { Product } from "@/types/catalog";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/cn";

/** Responsive grid with a staggered, one-time scroll reveal. 2-up on phones (360px+), 3-up tablet, 4-up desktop. */
export function ProductGrid({
  items,
  cols = 4,
  className,
  prioritizeFirst,
}: {
  items: Product[];
  cols?: 3 | 4;
  className?: string;
  prioritizeFirst?: boolean;
}) {
  return (
    <motion.ul
      {...reveal}
      variants={stagger(0.07)}
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 md:gap-x-6",
        cols === 4 && "xl:grid-cols-4",
        className,
      )}
    >
      {items.map((p, i) => (
        <motion.li key={p.id} variants={fadeUp} layout="position">
          <ProductCard product={p} priority={prioritizeFirst && i < 2} />
        </motion.li>
      ))}
    </motion.ul>
  );
}
