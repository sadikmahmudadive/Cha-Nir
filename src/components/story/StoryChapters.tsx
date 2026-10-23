"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArtImage } from "@/components/media/ArtImage";
import type { ArtKind, ArtTone } from "@/types/catalog";

gsap.registerPlugin(ScrollTrigger);

const chapters: { n: string; title: string; body: string; kind: ArtKind; tone: ArtTone; image?: string }[] = [
  {
    n: "01",
    title: "Sourcing",
    body: "Cha Nir sources tea from quality tea gardens across Bangladesh, choosing leaf for character, colour and consistency.",
    kind: "garden",
    tone: "deep",
    image: "/images/image_sourching.png",
  },
  { n: "02", title: "Processing", body: "The leaf is carefully processed and graded, so every pack brews the way you expect it to.", kind: "leaf", tone: "deep" },
  { n: "03", title: "Packaging", body: "Packed in sizes for homes and for business, from small retail packs to bulk supply.", kind: "pack", tone: "deep" },
  { n: "04", title: "Sharing", body: "Then the best part: a pot on the table, a glass in the hand, a conversation worth staying for.", kind: "ritual", tone: "warm" },
];

/**
 * Pinned four-chapter story. One GSAP timeline scrubbed by scroll: each chapter's still
 * is wiped in with clip-path while its caption steps up. Illustrative imagery.
 */
export function StoryChapters() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const layers = gsap.utils.toArray<HTMLElement>("[data-layer]", el);
      const copies = gsap.utils.toArray<HTMLElement>("[data-copy]", el);
      const ticks = gsap.utils.toArray<HTMLElement>("[data-tick]", el);

      gsap.set(layers.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(copies.slice(1), { autoAlpha: 0, y: 48 });
      gsap.set(ticks.slice(1), { scaleY: 0.25, opacity: 0.4 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top 72px", end: "bottom bottom", scrub: 0.6 },
      });
      // slow push-in on every still for the whole length
      tl.fromTo(gsap.utils.toArray<HTMLElement>("[data-art]", el), { scale: 1.14 }, { scale: 1, duration: chapters.length }, 0);

      for (let i = 1; i < chapters.length; i++) {
        const at = i - 0.1;
        tl.to(layers[i], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power2.inOut" }, at);
        tl.to(copies[i - 1], { autoAlpha: 0, y: -48, duration: 0.35 }, at - 0.05);
        tl.to(copies[i], { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.3);
        tl.to(ticks[i], { scaleY: 1, opacity: 1, duration: 0.4 }, at + 0.2);
      }
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      id="story"
      aria-label="From Bangladesh's tea gardens to your cup"
      className="relative h-[460svh] bg-night text-cream motion-reduce:h-auto"
    >
      <div className="sticky top-[var(--header-h)] h-[calc(100svh-var(--header-h))] overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:space-y-1 motion-reduce:overflow-visible">
        {chapters.map((c, i) => (
          <div key={c.n} data-layer className="absolute inset-0 motion-reduce:relative motion-reduce:h-[70svh]">
            <div data-art className="absolute inset-0">
              {c.image ? (
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  priority={i === 0}
                  className="size-full object-cover object-center"
                  sizes="100vw"
                />
              ) : (
                <ArtImage kind={c.kind} tone={c.tone} seed={i + 12} className="absolute inset-0 size-full" />
              )}
            </div>
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night via-night/45 to-night/10" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-night/85 via-night/30 to-transparent" />
            <div data-copy className="container-x absolute inset-x-0 bottom-0 pb-[12svh] motion-reduce:pb-12">
              <p className="font-display text-[clamp(5rem,16vw,13rem)] italic leading-none text-lime-400/90">{c.n}</p>
              <h2 className="t-h1 -mt-2 text-balance">{c.title}</h2>
              <p className="mt-4 max-w-md text-lg text-cream/75 text-pretty">{c.body}</p>
            </div>
          </div>
        ))}
        <p className="absolute right-[var(--gutter)] top-6 z-10 rounded-full bg-night/60 px-4 py-2 text-xs font-semibold text-cream/80 backdrop-blur max-md:hidden">
          Illustrative visuals · not footage of Cha Nir&rsquo;s facilities
        </p>
        <div aria-hidden className="absolute bottom-[12svh] right-[var(--gutter)] z-10 flex h-40 flex-col justify-between max-md:hidden">
          {chapters.map((c) => (
            <span key={c.n} data-tick className="block w-0.5 flex-1 origin-bottom rounded-full bg-lime-400" style={{ margin: "2px 0" }} />
          ))}
        </div>
      </div>
    </section>
  );
}
