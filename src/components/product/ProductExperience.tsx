"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Check, ShoppingBag, Truck, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cartActions } from "@/context/cart-store";
import { Photo } from "@/components/media/Photo";
import { hashSeed } from "@/components/media/ArtImage";
import { ProductViewer } from "@/components/three/ProductViewer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert, Price, QuantityStepper, Rating } from "@/components/ui/misc";
import { categoryById, defaultVariant } from "@/data/demo/catalog";
import { cn } from "@/lib/cn";
import { formatBDT } from "@/lib/format";
import { ease } from "@/lib/motion";
import { stockState, type Product } from "@/types/catalog";

export function ProductExperience({ product }: { product: Product }) {
  const router = useRouter();
  const [vid, setVid] = useState(() => defaultVariant(product).id);
  const [qty, setQty] = useState(1);
  const [idx, setIdx] = useState(0);
  const [view3d, setView3d] = useState(false);
  const [added, setAdded] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const cta = useRef<HTMLDivElement>(null);

  const variant = product.variants.find((v) => v.id === vid) ?? product.variants[0];
  const stock = stockState(variant.stock);
  const cat = categoryById(product.categoryId);
  const canBuy = stock !== "out";
  const seed = hashSeed(product.id);

  // sticky mobile purchase bar appears once the main CTA scrolls out of view
  useEffect(() => {
    const el = cta.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBarVisible(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(t);
  }, [added]);

  const add = () => {
    if (cartActions.add(product, variant, qty)) setAdded(true);
  };
  const buyNow = () => {
    if (cartActions.add(product, variant, qty)) router.push("/checkout");
  };
  const pick = (id: string) => {
    setVid(id);
    setQty(1);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
      {/* gallery */}
      <div className="lg:col-span-6">
        <div className="mx-auto max-w-[36rem] lg:sticky lg:top-28 lg:mx-0 lg:max-w-none">
          <div className="relative">
            {view3d && product.viewer ? (
              <ProductViewer fallback={product.gallery[idx]} variantLabel={variant.label} modelUrl={product.viewer.modelUrl} />
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease }}
                  className="overflow-hidden rounded-card"
                >
                  <Photo image={product.gallery[idx]} ratio="1/1" rounded={false} priority sizes="(min-width:1024px) 55vw, 100vw" seed={seed + idx} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
          <ul className="mt-3 flex gap-2.5 overflow-x-auto pb-1 no-scrollbar" aria-label="Product images">
            {product.gallery.map((g, i) => (
              <li key={i} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIdx(i);
                    setView3d(false);
                  }}
                  aria-label={`Show image ${i + 1}: ${g.alt}`}
                  aria-pressed={!view3d && idx === i}
                  className={cn(
                    "block w-[4.5rem] cursor-pointer overflow-hidden rounded-md border-2 transition-colors sm:w-24",
                    !view3d && idx === i ? "border-tea-600" : "border-transparent hover:border-tea-300",
                  )}
                >
                  <Photo image={g} ratio="1/1" rounded={false} sizes="96px" seed={seed + i} />
                </button>
              </li>
            ))}
            {product.viewer && (
              <li className="shrink-0">
                <button
                  type="button"
                  onClick={() => setView3d(true)}
                  aria-pressed={view3d}
                  className={cn(
                    "grid aspect-square w-[4.5rem] cursor-pointer place-items-center rounded-md border-2 bg-tea-100 text-sm font-bold text-tea-800 transition-colors sm:w-24",
                    view3d ? "border-tea-600" : "border-transparent hover:border-tea-300",
                  )}
                >
                  3D view
                </button>
              </li>
            )}
          </ul>
          {view3d && (
            <p className="mt-2 text-xs text-ink-mute">3D preview uses a placeholder pack. It will use approved packaging artwork or a GLB model once supplied.</p>
          )}
        </div>
      </div>

      {/* purchase panel */}
      <div className="lg:col-span-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="t-eyebrow text-tea-600">{cat?.name}</p>
          {product.badge && <Badge tone={product.badge === "New" ? "lime" : "dark"}>{product.badge}</Badge>}
          <Badge>Demo product</Badge>
        </div>
        <h1 className="t-h1 mt-3 text-tea-900">{product.name}</h1>
        <p className="mt-3 text-ink-soft text-pretty">{product.short}</p>
        <div className="mt-3">
          {product.rating ? <Rating {...product.rating} /> : <p className="text-sm text-ink-mute">No verified reviews yet.</p>}
        </div>

        <div className="mt-6 border-t border-line pt-6">
          <motion.div layout="position" className="flex items-end justify-between gap-4">
            <Price price={variant.price} compareAt={variant.compareAt} size="lg" />
            <motion.p key={variant.id + stock} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-1" role="status">
              {stock === "in" && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success"><span className="size-2 rounded-full bg-success" aria-hidden />In stock</span>
              )}
              {stock === "low" && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-warn"><span className="size-2 rounded-full bg-warn" aria-hidden />Only {variant.stock} left</span>
              )}
              {stock === "out" && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-danger"><span className="size-2 rounded-full bg-danger" aria-hidden />Out of stock</span>
              )}
            </motion.p>
          </motion.div>

          <fieldset className="mt-6">
            <legend className="mb-3 text-sm font-semibold">
              Pack size: <span className="font-bold text-tea-800">{variant.label}</span>
            </legend>
            <LayoutGroup id={`variant-${product.id}`}>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {product.variants.map((v) => {
                  const sel = v.id === vid;
                  const out = v.stock <= 0;
                  return (
                    <label key={v.id} className="relative cursor-pointer">
                      <input type="radio" name="variant" value={v.id} checked={sel} onChange={() => pick(v.id)} className="peer sr-only" />
                      <span
                        className={cn(
                          "relative flex min-h-16 flex-col justify-center rounded-md border px-4 py-2 transition-colors",
                          "border-line bg-paper hover:border-tea-500",
                          "peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lime-500",
                          out && "opacity-60",
                        )}
                      >
                        {sel && (
                          <motion.span layoutId="variant-ring" className="absolute inset-0 rounded-md border-2 border-tea-600 bg-tea-50" transition={{ duration: 0.28, ease }} />
                        )}
                        <span className="relative font-bold">{v.label}</span>
                        <span className="relative text-sm tabular-nums text-ink-soft">{out ? "Out of stock" : formatBDT(v.price)}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </LayoutGroup>
          </fieldset>

          <div className="mt-6 flex flex-wrap items-center gap-3" ref={cta}>
            <QuantityStepper value={qty} onChange={setQty} max={Math.max(variant.stock, 1)} label="Quantity" />
            <Button
              size="lg"
              variant={added ? "accent" : "primary"}
              className="min-w-0 flex-1"
              disabled={!canBuy}
              onClick={add}
              iconLeft={
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={added ? "ok" : "bag"} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.16 }} className="grid">
                    {added ? <Check className="size-5" strokeWidth={3} aria-hidden /> : <ShoppingBag className="size-5" aria-hidden />}
                  </motion.span>
                </AnimatePresence>
              }
            >
              {canBuy ? (added ? "Added to cart" : "Add to Cart") : "Out of stock"}
            </Button>
          </div>
          <Button variant="secondary" size="lg" full className="mt-3" disabled={!canBuy} onClick={buyNow} iconLeft={<Zap className="size-5" aria-hidden />}>
            Buy Now
          </Button>
          {!canBuy && (
            <div className="mt-3">
              <Alert tone="warn" title="This pack size is out of stock">
                Choose another pack size, or <Link href="/wholesale#inquiry" className="font-semibold underline">ask us about availability</Link>.
              </Alert>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3 rounded-md bg-tea-100 p-4 text-sm">
          <Truck className="mt-0.5 size-5 shrink-0 text-tea-600" aria-hidden />
          <div>
            <p className="font-semibold text-tea-900">Delivery</p>
            <p className="text-ink-soft">
              Delivery charge is calculated at checkout from your district. Delivery times are confirmed by Cha Nir after you order.
            </p>
          </div>
        </div>

        {product.isBulk && (
          <div className="mt-4">
            <Alert tone="info" title="Buying for a business?">
              <Link href="/wholesale#inquiry" className="font-semibold underline underline-offset-2">Request wholesale pricing</Link> for volume and repeat-order terms.
            </Alert>
          </div>
        )}
      </div>

      {/* sticky mobile purchase bar */}
      <AnimatePresence>
        {barVisible && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.28, ease }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgb(48_42_35/0.25)] backdrop-blur lg:hidden"
          >
            <div className="mx-auto flex max-w-xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p className="text-sm text-ink-soft">{variant.label} · <span className="font-bold text-ink">{formatBDT(variant.price)}</span></p>
              </div>
              <Button size="md" disabled={!canBuy} onClick={add} variant={added ? "accent" : "primary"}>
                {canBuy ? (added ? "Added" : "Add to Cart") : "Out of stock"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
