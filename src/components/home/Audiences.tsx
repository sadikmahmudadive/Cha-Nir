"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Coffee, Hotel, House, Store, UtensilsCrossed } from "lucide-react";
import { Reveal, SplitHeading } from "@/components/Reveal";
import { PRODUCTS, SEGMENTS, type Segment } from "@/lib/products";

const ORDER: Segment[] = ["stall", "shop", "hotel", "restaurant", "home"];

const META: Record<Segment, { icon: typeof Coffee; image: string; alt: string }> = {
  stall: { icon: Coffee, image: "/img/cup-steam.webp", alt: "Steaming cup of tea on a wooden counter" },
  shop: { icon: Store, image: "/img/kraft-spill.webp", alt: "Kraft tea pack with loose leaf" },
  hotel: { icon: Hotel, image: "/img/bowl-teapot.webp", alt: "Tea bowl and white teapot, ready for service" },
  restaurant: { icon: UtensilsCrossed, image: "/img/green-bowl.webp", alt: "Bowl of pale tea beside leaf" },
  home: { icon: House, image: "/img/garden-house.webp", alt: "A house among misty tea hills" },
};

export function Audiences() {
  const [active, setActive] = useState<Segment>("stall");
  const seg = SEGMENTS[active];
  const picks = PRODUCTS.filter((p) => p.bestFor.includes(active)).slice(0, 3);

  return (
    <section className="container-x py-24 lg:py-32" aria-labelledby="aud-h">
      <Reveal>
        <p className="eyebrow">Who we pack for</p>
      </Reveal>
      <SplitHeading
        text="One tea house, five kinds of counter."
        className="mt-3 max-w-3xl text-4xl sm:text-5xl lg:text-6xl"
      />
      <h2 id="aud-h" className="sr-only">
        Who we pack for
      </h2>

      <div
        role="tablist"
        aria-label="Choose your kind of business"
        className="mt-10 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]"
      >
        {ORDER.map((s) => {
          const Icon = META[s].icon;
          const on = s === active;
          return (
            <button
              key={s}
              role="tab"
              id={`tab-${s}`}
              aria-selected={on}
              aria-controls={`panel-${s}`}
              onClick={() => setActive(s)}
              className={`relative inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full px-5 text-[0.9375rem] font-bold transition-colors ${
                on ? "text-cream" : "text-brown hover:bg-cream-2"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="aud-pill"
                  className="absolute inset-0 rounded-full bg-leaf"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon className="relative size-[1.1rem]" aria-hidden />
              <span className="relative">{SEGMENTS[s].plural}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid overflow-hidden rounded-[2rem] border border-line bg-[#fffdf6] lg:grid-cols-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            role="tabpanel"
            id={`panel-${active}`}
            aria-labelledby={`tab-${active}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="contents"
          >
            <div className="relative min-h-72 lg:min-h-[28rem]">
              <Image
                src={META[active].image}
                alt={META[active].alt}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center gap-6 p-7 sm:p-10 lg:p-14">
              <div>
                <p className="eyebrow">Best pack size · {seg.pack}</p>
                <h3 className="mt-3 text-3xl sm:text-4xl">Tea for {seg.plural.toLowerCase()}</h3>
                <p className="mt-4 text-lg text-brown-soft">{seg.blurb}</p>
              </div>
              <ul className="divide-y divide-line border-y border-line">
                {picks.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/shop/${p.slug}`}
                      className="group flex items-center justify-between gap-3 py-3.5 font-semibold"
                    >
                      <span>
                        {p.name}
                        <span className="ml-2 text-[0.875rem] font-medium text-brown-soft">{p.grade}</span>
                      </span>
                      <ArrowRight
                        className="size-4 shrink-0 text-leaf transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href={`/shop?for=${active}`} className="btn btn-lime">
                  Shop for {seg.plural.toLowerCase()}
                </Link>
                {active !== "home" && (
                  <Link href="/wholesale#quote" className="btn btn-ghost">
                    Ask for a quote
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
