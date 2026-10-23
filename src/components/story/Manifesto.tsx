"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WORDS: { w: string; em?: boolean }[] = [
  { w: "Tea" }, { w: "is" }, { w: "not" }, { w: "a" }, { w: "drink." },
  { w: "It" }, { w: "is" }, { w: "the" }, { w: "pause", em: true }, { w: "that" },
  { w: "makes" }, { w: "a" }, { w: "day", em: true }, { w: "worth" }, { w: "sharing." },
];

/** Pinned manifesto: words light up one by one as you scroll. */
export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el.querySelectorAll("[data-w]"),
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.16,
          scrollTrigger: { trigger: el, start: "top 72px", end: "bottom bottom", scrub: 0.5 },
        },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} aria-label="Manifesto" className="relative h-[230svh] bg-night text-cream motion-reduce:h-auto motion-reduce:py-28">
      <div className="container-x sticky top-[var(--header-h)] flex h-[calc(100svh-var(--header-h))] flex-col justify-center motion-reduce:static motion-reduce:h-auto">
        <p className="t-eyebrow mb-8 text-lime-300">Our belief</p>
        <p className="t-display max-w-5xl text-balance">
          {WORDS.map((x, i) => (
            <span key={i} data-w className={x.em ? "text-lime-300 italic" : undefined}>
              {x.w}{" "}
            </span>
          ))}
        </p>
        <p className="mt-10 max-w-md text-cream/60">Pure, honest tea from Bangladesh, handled with care from the leaf to the last sip.</p>
      </div>
    </section>
  );
}
