"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArtImage } from "@/components/media/ArtImage";
import { categories } from "@/data/demo/catalog";

gsap.registerPlugin(ScrollTrigger);

/** Horizontal reel of categories: pinned and scrubbed on desktop, native swipe on touch/small screens. */
export function CategoryReel() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const dist = () => Math.max(0, tr.scrollWidth - window.innerWidth + 96);
      gsap.to(tr, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 72px",
          end: () => `+=${dist() + window.innerHeight * 0.4}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      // images drift against the track for depth
      gsap.utils.toArray<HTMLElement>("[data-drift]", tr).forEach((img) => {
        gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: "none", scrollTrigger: { trigger: el, start: "top 72px", end: () => `+=${dist()}`, scrub: true } });
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} aria-labelledby="reel-title" className="relative flex min-h-[calc(100svh-var(--header-h))] flex-col justify-center overflow-hidden bg-night py-16 text-cream">
      <div className="container-x mb-8">
        <p className="t-eyebrow text-lime-300">Shop by category</p>
        <h2 id="reel-title" className="t-h1 mt-3 text-balance">Find your kind of tea</h2>
      </div>
      <ul
        ref={track}
        className="flex w-max gap-5 px-[var(--gutter)] max-md:w-full max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto max-md:pb-4 max-md:no-scrollbar"
      >
        {categories.map((c, i) => (
          <li key={c.id} className="w-[78vw] shrink-0 snap-center sm:w-[44vw] md:w-[30vw] lg:w-[24vw]">
            <Link href={`/shop?category=${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-card">
              <div data-drift className="absolute -inset-x-[8%] inset-y-0 transition-transform duration-700 ease-out-quint group-hover:scale-105">
                <ArtImage kind={c.image.kind} tone={c.image.tone === "light" ? "deep" : c.image.tone} seed={i + 2} className="absolute inset-0 size-full" />
              </div>
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                <div>
                  <p className="font-display text-sm italic text-lime-300">0{i + 1}</p>
                  <h3 className="font-display text-3xl leading-tight">{c.name}</h3>
                  <p className="mt-1 text-sm text-cream/70">{c.blurb}</p>
                </div>
                <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-lime-500 text-tea-950 transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="size-5" />
                </span>
              </div>
              <span className="sr-only">Shop {c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
