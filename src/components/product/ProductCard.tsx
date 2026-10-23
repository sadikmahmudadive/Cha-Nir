"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { Check, ShoppingBag, Sparkles, X, Flame, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cartActions } from "@/context/cart-store";
import { hashSeed } from "@/components/media/ArtImage";
import { Photo } from "@/components/media/Photo";
import { Badge } from "@/components/ui/Badge";
import { Price, Rating } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { categoryById, defaultVariant } from "@/data/demo/catalog";
import { getBotanicalProfile } from "@/data/botanical";
import { useHasFinePointer, usePrefersReducedMotion } from "@/components/three/capability";
import { cn } from "@/lib/cn";
import { stockState, type Product } from "@/types/catalog";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const [vid, setVid] = useState(() => defaultVariant(product).id);
  const [added, setAdded] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const finePointer = useHasFinePointer();
  const reduced = usePrefersReducedMotion();
  const canTilt = finePointer && !reduced;

  const variant = product.variants.find((v) => v.id === vid) ?? product.variants[0];
  const stock = stockState(variant.stock);
  const cat = categoryById(product.categoryId);
  const botanical = getBotanicalProfile(product.id);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 200, mass: 0.4 };
  const tiltX = useSpring(useMotionValue(0), springConfig);
  const tiltY = useSpring(useMotionValue(0), springConfig);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    mouseX.set(relX);
    mouseY.set(relY);

    const normX = (relX / rect.width - 0.5) * 2;
    const normY = (relY / rect.height - 0.5) * 2;

    tiltX.set(-normY * 6);
    tiltY.set(normX * 6);
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsHovered(true);
    handlePointerMove(e);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    tiltX.set(0);
    tiltY.set(0);
  };

  const dynamicSpotlight = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, rgba(165, 190, 22, 0.22), transparent 75%)`;

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <motion.article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={
        canTilt
          ? {
              rotateX: tiltX,
              rotateY: tiltY,
              transformPerspective: 1000,
              transformStyle: "preserve-3d",
            }
          : undefined
      }
      className={cn(
        "group relative flex h-full flex-col rounded-3xl border border-tea-900/10 bg-white/75 p-3.5 sm:p-4 shadow-soft transition-all duration-300",
        "hover:border-tea-900/20 hover:shadow-elevation hover:bg-white/95",
      )}
      aria-labelledby={`pc-${product.id}`}
    >
      {/* Magnetic spotlight overlay on pointer proximity */}
      {isHovered && canTilt && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300"
          style={{ background: dynamicSpotlight }}
        />
      )}

      {/* Top Pack Image Container */}
      <div className="relative isolate overflow-hidden rounded-2xl bg-tea-50/50">
        <Link
          href={`/shop/${product.slug}`}
          className="block overflow-hidden rounded-2xl"
          tabIndex={-1}
          aria-hidden
        >
          <div className="transition-transform duration-700 ease-out-quint group-hover:scale-[1.045]">
            <Photo
              image={product.image}
              ratio="4/5"
              sizes="(min-width:1280px) 22vw, (min-width:768px) 33vw, 50vw"
              priority={priority}
              rounded={false}
              seed={hashSeed(product.id)}
            />
          </div>
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5 z-10">
          {product.badge && (
            <Badge tone={product.badge === "New" ? "lime" : "dark"}>
              {product.badge}
            </Badge>
          )}
          {stock === "out" && <Badge tone="neutral">Out of stock</Badge>}
          {stock === "low" && <Badge tone="warn">Only {variant.stock} left</Badge>}
        </div>

        {/* Interactive Botanical Flavor Vault Trigger Pill */}
        <button
          type="button"
          onClick={() => setIsVaultOpen((v) => !v)}
          className={cn(
            "absolute right-3 bottom-3 z-10 flex items-center gap-1.5 rounded-full border border-tea-900/10 bg-cream/90 px-2.5 py-1 text-[11px] font-bold text-tea-900 shadow-soft backdrop-blur-md transition-all duration-200 cursor-pointer",
            "hover:scale-105 hover:bg-white active:scale-95",
            isVaultOpen && "bg-tea-900 text-cream border-tea-900 hover:bg-tea-900",
          )}
          aria-expanded={isVaultOpen}
          aria-label={`Inspect botanical flavor vault for ${product.name}`}
        >
          <span
            className="size-2 rounded-full transition-transform duration-300"
            style={{ backgroundColor: botanical.liquorColor }}
            aria-hidden
          />
          <Sparkles className="size-3" aria-hidden />
          <span>{isVaultOpen ? "Close Profile" : "Flavor Vault"}</span>
        </button>

        {/* Botanical Sensory Profile Drawer Overlay */}
        <AnimatePresence>
          {isVaultOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-2 z-20 flex flex-col justify-between rounded-xl border border-tea-900/15 bg-cream/95 p-3.5 shadow-elevation backdrop-blur-lg"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-tea-900/10 pb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="size-2.5 rounded-full animate-pulse"
                    style={{ backgroundColor: botanical.liquorColor }}
                    aria-hidden
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-tea-950">
                    Botanical Profile
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVaultOpen(false)}
                  className="rounded-full p-1 text-ink-mute hover:bg-tea-900/10 hover:text-tea-950 cursor-pointer"
                  aria-label="Close flavor vault"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </div>

              {/* Terroir & Elevation Specs */}
              <div className="space-y-1 py-1 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-ink-mute">Terroir:</span>
                  <span className="font-semibold text-tea-900 truncate max-w-[130px]">
                    {botanical.terroir}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-ink-mute">Elevation:</span>
                  <span className="font-semibold text-tea-900">{botanical.elevation}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-ink-mute">Liquor:</span>
                  <span
                    className="font-bold truncate max-w-[130px]"
                    style={{ color: botanical.liquorColor }}
                  >
                    {botanical.liquorName}
                  </span>
                </div>
              </div>

              {/* Sensory Metric Fill Bars */}
              <div className="space-y-1.5 border-t border-tea-900/10 pt-2 text-[10px]">
                {[
                  { label: "Aroma", val: botanical.metrics.aroma },
                  { label: "Body", val: botanical.metrics.body },
                  { label: "Briskness", val: botanical.metrics.briskness },
                  { label: "Sweet Finish", val: botanical.metrics.sweetFinish },
                ].map((m) => (
                  <div key={m.label} className="space-y-0.5">
                    <div className="flex justify-between font-semibold text-ink-soft">
                      <span>{m.label}</span>
                      <span className="text-tea-950 font-bold">{m.val}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-tea-900/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.val}%` }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: botanical.liquorColor }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Tasting notes chips & brew prompt */}
              <div className="border-t border-tea-900/10 pt-2">
                <div className="flex items-center justify-between text-[10px] text-ink-mute mb-1.5">
                  <span className="flex items-center gap-1 font-semibold text-tea-900">
                    <Flame className="size-3 text-tea-600" aria-hidden />
                    {botanical.brewSpecs.temp}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-tea-900">
                    <Timer className="size-3 text-tea-600" aria-hidden />
                    {botanical.brewSpecs.time}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {botanical.tastingNotes.map((note) => (
                    <span
                      key={note}
                      className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-tea-950 border border-tea-900/10"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Column */}
      <div className="mt-3.5 flex flex-1 flex-col gap-2 relative z-10">
        <div className="flex items-center justify-between gap-2">
          <p className="t-eyebrow text-tea-600">{cat?.name}</p>
          <span className="text-[11px] font-medium text-ink-mute">
            {botanical.elevation}
          </span>
        </div>

        <h3 id={`pc-${product.id}`} className="font-display text-[1.35rem] leading-tight text-tea-900">
          <Link
            href={`/shop/${product.slug}`}
            className="hover:underline decoration-lime-500 decoration-2 underline-offset-4"
          >
            {product.name}
          </Link>
        </h3>

        <p className="line-clamp-2 text-[0.88rem] leading-snug text-ink-soft">
          {product.short}
        </p>

        {product.rating && <Rating {...product.rating} />}

        {/* Variant Pack Selector */}
        {product.variants.length > 1 ? (
          <fieldset className="mt-1">
            <legend className="sr-only">Pack size for {product.name}</legend>
            <div className="flex flex-wrap gap-1.5">
              {product.variants.map((v) => {
                const isChecked = v.id === vid;
                return (
                  <label key={v.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name={`pack-${product.id}`}
                      value={v.id}
                      checked={isChecked}
                      onChange={() => setVid(v.id)}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "inline-flex min-h-8 items-center rounded-xl border px-2.5 text-xs font-semibold transition-all duration-200",
                        "border-tea-900/10 text-ink-soft hover:border-tea-500 hover:text-tea-950",
                        "peer-checked:border-tea-700 peer-checked:bg-tea-800 peer-checked:text-cream peer-checked:shadow-xs",
                        v.stock <= 0 && "line-through opacity-50",
                      )}
                    >
                      {v.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <p className="text-xs font-semibold text-ink-soft">{variant.label}</p>
        )}

        {/* Pricing */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <Price price={variant.price} compareAt={variant.compareAt} />
          <span className="text-[11px] font-medium text-tea-700/80">
            {botanical.tastingNotes[0]}
          </span>
        </div>

        {/* Quick Add Button with checkmark transition */}
        <Button
          full
          size="sm"
          variant={added ? "accent" : "primary"}
          disabled={stock === "out"}
          onClick={() => {
            if (cartActions.add(product, variant, 1)) setAdded(true);
          }}
          aria-label={
            stock === "out"
              ? `${product.name} ${variant.label} is out of stock`
              : `Add ${product.name}, ${variant.label}, to cart`
          }
          iconLeft={
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={added ? "ok" : "bag"}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="grid"
              >
                {added ? (
                  <Check className="size-4" strokeWidth={3} aria-hidden />
                ) : (
                  <ShoppingBag className="size-4" aria-hidden />
                )}
              </motion.span>
            </AnimatePresence>
          }
        >
          {stock === "out" ? "Out of stock" : added ? "Added to Cart" : "Quick add"}
        </Button>
      </div>
    </motion.article>
  );
}
