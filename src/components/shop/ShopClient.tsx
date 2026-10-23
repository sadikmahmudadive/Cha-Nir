"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Filter, PackageSearch, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { Checkbox } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { categories, products } from "@/data/demo/catalog";
import { cn } from "@/lib/cn";
import { formatBDT } from "@/lib/format";
import { ease } from "@/lib/motion";
import type { Product } from "@/types/catalog";

const PAGE = 8;

const sizeOptions = Array.from(new Set(products.flatMap((p) => p.variants.map((v) => v.label))));
const maxPrice = Math.max(...products.flatMap((p) => p.variants.map((v) => v.price)));

const sorts = [
  { id: "relevance", label: "Relevance" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
] as const;

interface Filters {
  q: string;
  cats: string[];
  sizes: string[];
  min: number | null;
  max: number | null;
  stock: boolean;
  sort: (typeof sorts)[number]["id"];
}

const lowest = (p: Product) => Math.min(...p.variants.map((v) => v.price));

function apply(f: Filters): Product[] {
  const term = f.q.trim().toLowerCase();
  const out = products.filter((p) => {
    if (term) {
      const cat = categories.find((c) => c.id === p.categoryId)?.name ?? "";
      if (!`${p.name} ${p.short} ${cat}`.toLowerCase().includes(term)) return false;
    }
    if (f.cats.length && !f.cats.includes(categories.find((c) => c.id === p.categoryId)?.slug ?? "")) return false;
    const pool = p.variants.filter(
      (v) =>
        (!f.sizes.length || f.sizes.includes(v.label)) &&
        (!f.stock || v.stock > 0) &&
        (f.min === null || v.price >= f.min) &&
        (f.max === null || v.price <= f.max),
    );
    return pool.length > 0;
  });
  const by = {
    relevance: (a: Product, b: Product) =>
      Number(!!b.bestseller) - Number(!!a.bestseller) || Number(!!b.featured) - Number(!!a.featured),
    newest: (a: Product, b: Product) => b.createdAt.localeCompare(a.createdAt),
    "price-asc": (a: Product, b: Product) => lowest(a) - lowest(b),
    "price-desc": (a: Product, b: Product) => lowest(b) - lowest(a),
  }[f.sort];
  return out.sort(by);
}

function parse(sp: URLSearchParams): Filters {
  const list = (k: string) => sp.get(k)?.split(",").filter(Boolean) ?? [];
  const num = (k: string) => {
    const v = sp.get(k);
    return v && !Number.isNaN(Number(v)) ? Number(v) : null;
  };
  const sort = sp.get("sort") as Filters["sort"];
  return {
    q: sp.get("q") ?? "",
    cats: list("category"),
    sizes: list("size"),
    min: num("min"),
    max: num("max"),
    stock: sp.get("stock") === "1",
    sort: sorts.some((s) => s.id === sort) ? sort : "relevance",
  };
}

function FilterPanel({
  f,
  update,
}: {
  f: Filters;
  update: (patch: Partial<Record<string, string | null>>) => void;
}) {
  const toggle = (key: "category" | "size", list: string[], v: string) => {
    const next = list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
    update({ [key]: next.length ? next.join(",") : null });
  };
  const [min, setMin] = useState(f.min?.toString() ?? "");
  const [max, setMax] = useState(f.max?.toString() ?? "");
  const [syncKey, setSyncKey] = useState(`${f.min}-${f.max}`);
  if (syncKey !== `${f.min}-${f.max}`) {
    setSyncKey(`${f.min}-${f.max}`);
    setMin(f.min?.toString() ?? "");
    setMax(f.max?.toString() ?? "");
  }
  const commit = () => update({ min: min || null, max: max || null });

  return (
    <Accordion
      single={false}
      defaultOpen={["category", "price", "avail", "size"]}
      items={[
        {
          id: "category",
          title: "Category",
          content: (
            <ul className="-mt-1 space-y-0.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <Checkbox label={c.name} checked={f.cats.includes(c.slug)} onChange={() => toggle("category", f.cats, c.slug)} />
                </li>
              ))}
            </ul>
          ),
        },
        {
          id: "price",
          title: "Price (BDT)",
          content: (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                commit();
              }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <label className="flex-1">
                  <span className="sr-only">Minimum price</span>
                  <input
                    inputMode="numeric"
                    placeholder="Min"
                    value={min}
                    onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))}
                    onBlur={commit}
                    className="min-h-11 w-full rounded-md border border-line bg-paper px-3 focus:border-tea-600 focus:outline-none focus:ring-4 focus:ring-lime-500/30"
                  />
                </label>
                <span aria-hidden>–</span>
                <label className="flex-1">
                  <span className="sr-only">Maximum price</span>
                  <input
                    inputMode="numeric"
                    placeholder="Max"
                    value={max}
                    onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))}
                    onBlur={commit}
                    className="min-h-11 w-full rounded-md border border-line bg-paper px-3 focus:border-tea-600 focus:outline-none focus:ring-4 focus:ring-lime-500/30"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ["Under ৳300", null, "300"],
                  ["৳300–1,000", "300", "1000"],
                  ["Over ৳1,000", "1000", null],
                ].map(([label, a, b]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => update({ min: a, max: b })}
                    className="min-h-10 cursor-pointer rounded-full border border-line px-3.5 text-[0.82rem] font-semibold hover:border-tea-600 hover:bg-tea-100"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-ink-mute">Prices run up to {formatBDT(maxPrice)}.</p>
            </form>
          ),
        },
        {
          id: "avail",
          title: "Availability",
          content: (
            <div className="-mt-1">
              <Checkbox label="In stock only" checked={f.stock} onChange={() => update({ stock: f.stock ? null : "1" })} />
            </div>
          ),
        },
        {
          id: "size",
          title: "Pack size / weight",
          content: (
            <ul className="-mt-1 grid grid-cols-2 gap-x-2">
              {sizeOptions.map((s) => (
                <li key={s}>
                  <Checkbox label={s} checked={f.sizes.includes(s)} onChange={() => toggle("size", f.sizes, s)} />
                </li>
              ))}
            </ul>
          ),
        },
      ]}
    />
  );
}

export function ShopClient() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const f = useMemo(() => parse(new URLSearchParams(sp.toString())), [sp]);
  const [drawer, setDrawer] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [q, setQ] = useState(f.q);
  const lastQ = useRef(f.q);

  const update = (patch: Partial<Record<string, string | null>>) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v == null || v === "" ? next.delete(k) : next.set(k, v)));
    setShown(PAGE);
    router.replace(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  // debounce search input → URL
  useEffect(() => {
    if (q === lastQ.current) return;
    const t = setTimeout(() => {
      lastQ.current = q;
      update({ q: q.trim() || null });
    }, 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // external changes to ?q (e.g. header search) → input
  useEffect(() => {
    if (f.q !== lastQ.current) {
      lastQ.current = f.q;
      setQ(f.q);
    }
  }, [f.q]);

  const results = useMemo(() => apply(f), [f]);
  const visible = results.slice(0, shown);

  const chips: { key: string; label: string; remove: () => void }[] = [
    ...(f.q ? [{ key: "q", label: `“${f.q}”`, remove: () => { setQ(""); update({ q: null }); } }] : []),
    ...f.cats.map((c) => ({
      key: `c-${c}`,
      label: categories.find((x) => x.slug === c)?.name ?? c,
      remove: () => update({ category: f.cats.filter((x) => x !== c).join(",") || null }),
    })),
    ...f.sizes.map((s) => ({ key: `s-${s}`, label: s, remove: () => update({ size: f.sizes.filter((x) => x !== s).join(",") || null }) })),
    ...(f.stock ? [{ key: "stock", label: "In stock", remove: () => update({ stock: null }) }] : []),
    ...(f.min !== null || f.max !== null
      ? [{
          key: "price",
          label: `${f.min !== null ? formatBDT(f.min) : "৳0"} – ${f.max !== null ? formatBDT(f.max) : "any"}`,
          remove: () => update({ min: null, max: null }),
        }]
      : []),
  ];

  const clearAll = () => {
    setQ("");
    lastQ.current = "";
    setShown(PAGE);
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_1fr] xl:grid-cols-[18.5rem_1fr]">
      {/* desktop filters */}
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-28 max-h-[calc(100svh-8rem)] overflow-y-auto overscroll-contain rounded-card border border-line bg-paper p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-display text-xl">Filters</h2>
            {chips.length > 0 && (
              <button type="button" onClick={clearAll} className="min-h-9 cursor-pointer text-sm font-semibold text-tea-700 underline underline-offset-4">
                Clear all
              </button>
            )}
          </div>
          <FilterPanel f={f} update={update} />
        </div>
      </aside>

      <div className="min-w-0">
        {/* toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form role="search" className="relative flex-1" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="shop-q" className="sr-only">Search tea</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-mute" aria-hidden />
            <input
              id="shop-q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tea"
              className="min-h-12 w-full rounded-full border border-line bg-paper pl-12 pr-4 focus:border-tea-600 focus:outline-none focus:ring-4 focus:ring-lime-500/30"
            />
          </form>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setDrawer(true)} iconLeft={<Filter className="size-4" aria-hidden />} aria-haspopup="dialog">
              Filters{chips.length ? ` (${chips.length})` : ""}
            </Button>
            <label className="ml-auto flex items-center gap-2 text-sm sm:ml-0">
              <span className="font-semibold text-ink-soft">Sort</span>
              <select
                value={f.sort}
                onChange={(e) => update({ sort: e.target.value === "relevance" ? null : e.target.value })}
                className="min-h-11 cursor-pointer rounded-full border border-line bg-paper px-4 font-medium focus:border-tea-600 focus:outline-none focus:ring-4 focus:ring-lime-500/30"
              >
                {sorts.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* active chips */}
        <AnimatePresence initial={false}>
          {chips.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24, ease }}
              className="flex flex-wrap items-center gap-2 overflow-hidden pt-4"
              aria-label="Active filters"
            >
              {chips.map((c) => (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={c.remove}
                    className="group inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full bg-tea-100 py-1 pl-4 pr-2.5 text-sm font-semibold text-tea-800 hover:bg-tea-200"
                    aria-label={`Remove filter: ${c.label}`}
                  >
                    {c.label}
                    <X className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={clearAll} className="min-h-10 cursor-pointer px-2 text-sm font-semibold text-ink-soft underline underline-offset-4">
                  Clear all
                </button>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>

        <p className="mt-5 text-sm text-ink-mute" role="status" aria-live="polite">
          {results.length === 0 ? "No teas match" : `Showing ${visible.length} of ${results.length} ${results.length === 1 ? "tea" : "teas"}`}
        </p>

        <div className="mt-6">
          {results.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="size-8" aria-hidden />}
              title="No tea matches those filters"
              body="Try removing a filter or searching a different word. Demo catalogue only."
              action={{ label: "Clear all filters", onClick: clearAll }}
              className="rounded-card border border-dashed border-line"
            />
          ) : (
            <ProductGrid items={visible} cols={3} prioritizeFirst />
          )}
        </div>

        {results.length > shown && (
          <div className="mt-12 flex flex-col items-center gap-2">
            <Button variant="secondary" size="lg" onClick={() => setShown((n) => n + PAGE)}>
              Show more tea
            </Button>
            <p className="text-sm text-ink-mute">{results.length - shown} more</p>
          </div>
        )}
      </div>

      {/* mobile filter drawer */}
      <Sheet
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Filters"
        side="bottom"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={clearAll} className="flex-1">Clear all</Button>
            <Button onClick={() => setDrawer(false)} className="flex-[2]">Show {results.length} {results.length === 1 ? "result" : "results"}</Button>
          </div>
        }
      >
        <FilterPanel f={f} update={update} />
      </Sheet>
    </div>
  );
}

export function ShopSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_1fr]" aria-busy="true" aria-label="Loading tea">
      <Skeleton className="hidden h-[32rem] lg:block" />
      <div>
        <Skeleton className="h-12 w-full rounded-full" />
        <div className={cn("mt-8 grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3")}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/5] w-full rounded-card" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-11 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
