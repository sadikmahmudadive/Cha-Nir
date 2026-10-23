"use client";

import dynamic from "next/dynamic";
import { useInView, useMotionValueEvent, useScroll } from "motion/react";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { useCapability, useHasFinePointer, usePrefersReducedMotion } from "../capability";
import { HeroContent } from "./HeroContent";
import { HeroFallback } from "./HeroFallback";
import { HeroNature } from "./HeroNature";
import { HeroSensoryBadges } from "./HeroSensoryBadges";
import { TEA_VARIETIES, type TeaVariety } from "./varieties";

// The entire 3D scene (three + R3F + drei + shaders) is a separate chunk,
// requested only when this hero is going to render it.
const TeaScene = dynamic(() => import("./TeaScene"), { ssr: false });

const noop = () => () => {};
/** Reads `?tea_t=<seconds>` (debug / poster capture): freezes the timeline at that moment. */
function useFixedT(): number | undefined {
  const raw = useSyncExternalStore(
    noop,
    () => new URLSearchParams(window.location.search).get("tea_t"),
    () => null,
  );
  return raw !== null && !Number.isNaN(Number(raw)) ? Number(raw) : undefined;
}

function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function TeaHero() {
  const stage = useRef<HTMLDivElement>(null);
  const fade = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { margin: "160px" });
  const cap = useCapability();
  const reduced = usePrefersReducedMotion();
  const finePointer = useHasFinePointer();
  const wide = useMedia("(min-width: 1024px)");
  const phone = useMedia("(max-width: 767px)");
  const fixedT = useFixedT();
  const [activeVariety, setActiveVariety] = useState<TeaVariety>(TEA_VARIETIES[0]);
  const [idle, setIdle] = useState(false);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const wrap = useRef<HTMLElement>(null);
  const scrollRef = useRef(0);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start 72px", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollRef.current = Math.min(1, Math.max(0, v));
  });

  // let the headline, CTAs and poster paint first; then fetch the 3D chunk
  useEffect(() => {
    const id = window.setTimeout(() => setIdle(true), 600);
    return () => clearTimeout(id);
  }, []);

  const lowPower = phone || (typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4);
  const render3d = cap === "yes" && idle && (!reduced || fixedT !== undefined);
  // The ritual is scrubbed by scroll: a tall section with a sticky stage. Only when 3D can run.
  const scrolly = cap === "yes" && !reduced && fixedT === undefined;

  return (
    <section
      ref={wrap}
      aria-labelledby="hero-title"
      className={cn("relative isolate", scrolly ? "h-[460svh]" : "overflow-hidden")}
    >
      <div
        className={cn(
          scrolly ? "sticky top-[var(--header-h)] flex h-[calc(100svh-var(--header-h))] flex-col overflow-hidden lg:block" : "relative",
        )}
      >
        <HeroNature />
        {/* Text column (real HTML, above the stage on every breakpoint) */}
        <div className={cn("container-x relative z-10 lg:flex lg:items-center", scrolly ? "lg:h-full" : "lg:min-h-[min(46rem,calc(100svh-7.5rem))]")}>
          <HeroContent activeVariety={activeVariety} onSelectVariety={setActiveVariety} />
        </div>

        {/* Stage: reserved size, no layout shift. Overlays the section on desktop. */}
        <div
          ref={stage}
          className={cn(
            "relative w-full lg:absolute lg:inset-0 lg:z-0 lg:mt-0 lg:aspect-auto",
            scrolly ? "min-h-0 flex-1" : "-mt-4 aspect-square sm:aspect-[5/4]",
          )}
        >
          {/* Dynamic terroir ambient halo matching selected tea liquor hue */}
          <div
            aria-hidden
            className="absolute left-1/2 top-[52%] aspect-square w-[min(88%,100%)] -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-700 max-lg:h-[96%] max-lg:w-auto lg:left-[64%] lg:w-[min(44rem,52vw)]"
            style={{
              background: `radial-gradient(circle, ${activeVariety.accentColor}22 0%, var(--color-tea-100, #F0EFE6) 68%)`,
            }}
          />
          <HeroFallback hidden={ready} />

          {/* Floating sensory badges (altitude, pluck, live aroma notes) with spring parallax */}
          <HeroSensoryBadges
            variety={activeVariety}
            pointerEnabled={finePointer && !reduced && !phone}
          />

          {render3d && (
            <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}>
              <div ref={fade} className="absolute inset-0">
                <TeaScene
                  active={inView}
                  paused={paused}
                  lowPower={lowPower}
                  pointerEnabled={finePointer && !reduced && !phone}
                  wide={wide}
                  fadeRef={fade}
                  onReady={() => setReady(true)}
                  variety={activeVariety}
                  fixedT={fixedT}
                  scrollRef={scrolly ? scrollRef : undefined}
                />
              </div>
            </div>
          )}

          {render3d && ready && fixedT === undefined && !scrolly && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              className="absolute bottom-3 right-3 z-10 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-cream/85 px-4 text-sm font-semibold text-ink shadow-soft backdrop-blur hover:bg-white lg:bottom-6 lg:right-[var(--gutter)]"
            >
              {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
              {paused ? "Play animation" : "Pause animation"}
            </button>
          )}

          {scrolly && ready && (
            <p className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-cream/85 px-4 py-2 text-xs font-semibold text-ink-soft shadow-soft backdrop-blur max-lg:hidden">
              Scroll: pour, brew, sip
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
