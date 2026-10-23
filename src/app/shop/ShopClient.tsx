"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import {
  CATEGORIES,
  fromPrice,
  PRODUCTS,
  SEGMENTS,
  type Category,
  type Segment,
} from "@/lib/products";

type Sort = "featured" | "price-asc" | "price-desc" | "name";

export function ShopClient() {
  const params = useSearchParams();
  const initialCat = CATEGORIES.find((c) => c === params.get("cat")) ?? "All";
  const forParam = params.get("for") as Segment | null;
  const initialFor: Segment | "all" = forParam && forParam in SEGMENTS ? forParam : "all";

  const [cat, setCat] = useState<"All" | Category>(initialCat);
  const [seg, setSeg] = useState<Segment | "all">(initialFor);
  const [sort, setSort] = useState<Sort>("featured");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = PRODUCTS.filter(
      (p) =>
        (cat === "All" || p.category === cat) &&
        (seg === "all" || p.bestFor.includes(seg)) &&
        (!needle ||
          `${p.name} ${p.category} ${p.grade} ${p.notes.join(" ")}`.toLowerCase().includes(needle)),
    );
    if (sort === "price-asc") out.sort((a, b) => fromPrice(a) - fromPrice(b));
    if (sort === "price-desc") out.sort((a, b) => fromPrice(b) - fromPrice(a));
    if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [cat, seg, sort, q]);

  const dirty = cat !== "All" || seg !== "all" || q !== "";
  const reset = () => {
    setCat("All");
    setSeg("all");
    setQ("");
    setSort("featured");
  };

  return (
    <div className="mt-10">
      <div className="sticky top-[4.25rem] z-30 -mx-5 border-y border-line bg-cream/90 px-5 py-3 backdrop-blur-md md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Category" className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {CATEGORIES.map((c) => {
              const on = c === cat;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCat(c)}
                  className={`relative min-h-11 shrink-0 rounded-full px-5 text-[0.9375rem] font-bold transition-colors ${
                    on ? "text-cream" : "text-brown hover:bg-cream-2"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="cat-pill"
                      className="absolute inset-0 rounded-full bg-leaf"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{c}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto_auto] lg:w-[34rem]">
            <label className="relative col-span-2 sm:col-span-1">
              <span className="sr-only">Search teas</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brown-soft" aria-hidden />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search teas"
                className="field !pl-10"
              />
            </label>
            <label>
              <span className="sr-only">Best for</span>
              <select
                value={seg}
                onChange={(e) => setSeg(e.target.value as Segment | "all")}
                className="field"
              >
                <option value="all">Best for: anyone</option>
                {(Object.keys(SEGMENTS) as Segment[]).map((s) => (
                  <option key={s} value={s}>
                    {SEGMENTS[s].plural}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-[0.9375rem] font-semibold text-brown-soft" aria-live="polite">
          {list.length} {list.length === 1 ? "tea" : "teas"}
        </p>
        {dirty && (
          <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-bold text-leaf hover:underline">
            <X className="size-4" aria-hidden /> Clear filters
          </button>
        )}
      </div>

      <motion.div layout className="mt-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <ProductCard key={p.slug} product={p} priority={i < 4} />
          ))}
        </AnimatePresence>
      </motion.div>

      {list.length === 0 && (
        <div className="card mt-6 px-6 py-16 text-center">
          <p className="font-serif text-2xl">No teas match that search</p>
          <p className="mt-2 text-brown-soft">Try a different word or clear the filters.</p>
          <button type="button" onClick={reset} className="btn btn-lime mt-6">
            Show all teas
          </button>
        </div>
      )}
    </div>
  );
}
